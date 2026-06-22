import { Injectable, OnDestroy, signal } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, retry, timer, map, share, Subject } from 'rxjs';
import {
  BinanceRawTicker,
  BinanceTicker,
  BinanceSymbolInfo,
  BinanceRawKlineMessage,
  Candle,
} from '../models/types';

@Injectable({ providedIn: 'root' })
export class BinanceWebsocketService implements OnDestroy {
  private readonly WS_TICKERS = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
  private readonly REST_URL = 'https://api.binance.com/api/v3';
  private tickerSocket$: WebSocketSubject<BinanceRawTicker[]>;

  readonly symbols = signal<BinanceSymbolInfo[]>([]);

  allTickers$: Observable<BinanceTicker[]>;

  private klineSubject = new Subject<Candle>();
  kline$ = this.klineSubject.asObservable();
  private klineSocket: WebSocketSubject<BinanceRawKlineMessage> | null = null;

  constructor() {
    this.fetchSymbols();

    this.tickerSocket$ = webSocket<BinanceRawTicker[]>({
      url: this.WS_TICKERS,
      deserializer: (msg) => JSON.parse(msg.data) as BinanceRawTicker[],
    });

    this.allTickers$ = this.tickerSocket$.pipe(
      map((rawArray) => rawArray.map((raw) => this.transformTicker(raw))),
      retry({
        count: Infinity,
        delay: (_err, retryCount) => timer(Math.min(1000 * Math.pow(2, retryCount), 30000)),
      }),
      share()
    );
  }

  private async fetchSymbols(): Promise<void> {
    try {
      const res = await fetch(`${this.REST_URL}/exchangeInfo`);
      const data = (await res.json()) as { symbols: BinanceSymbolInfo[] };
      const usdt = data.symbols
        .filter((s) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
        .sort((a, b) => a.baseAsset.localeCompare(b.baseAsset));
      this.symbols.set(usdt);
    } catch {
      console.warn('Failed to fetch symbol list from Binance REST API');
    }
  }

  async fetchKlines(symbol: string, interval = '1m', limit = 100): Promise<Candle[]> {
    const url = `${this.REST_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    const data = (await res.json()) as Array<Array<number | string>>;
    return data.map((k) => ({
      time: k[0] as number,
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
    }));
  }

  connectKline(symbol: string): void {
    this.disconnectKline();

    const url = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_1m`;
    this.klineSocket = webSocket<BinanceRawKlineMessage>({
      url,
      deserializer: (msg) => JSON.parse(msg.data) as BinanceRawKlineMessage,
    });

    this.klineSocket
      .pipe(
        map((raw) => this.transformKline(raw)),
        retry({
          count: Infinity,
          delay: (_err, retryCount) => timer(Math.min(1000 * Math.pow(2, retryCount), 30000)),
        }),
      )
      .subscribe((candle) => this.klineSubject.next(candle));
  }

  disconnectKline(): void {
    if (this.klineSocket) {
      this.klineSocket.complete();
      this.klineSocket = null;
    }
  }

  private transformTicker(raw: BinanceRawTicker): BinanceTicker {
    const price = parseFloat(raw.c);
    const open = parseFloat(raw.o);
    return {
      symbol: raw.s,
      price,
      open,
      high: parseFloat(raw.h),
      low: parseFloat(raw.l),
      volume: parseFloat(raw.v),
      quoteVolume: parseFloat(raw.q),
      eventTime: raw.E,
      change24h: price - open,
      change24hPercent: ((price - open) / open) * 100,
    };
  }

  private transformKline(raw: BinanceRawKlineMessage): Candle {
    return {
      time: raw.k.t,
      open: parseFloat(raw.k.o),
      high: parseFloat(raw.k.h),
      low: parseFloat(raw.k.l),
      close: parseFloat(raw.k.c),
      volume: parseFloat(raw.k.v),
    };
  }

  disconnect(): void {
    this.tickerSocket$?.complete();
    this.disconnectKline();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
