import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, retry, timer, map, share, Subject } from 'rxjs';
import type { CryptoDataSourcePort } from '../../../core/ports';
import type { Ticker, Candle, SymbolInfo } from '../../../core/domain';
import { BinanceMapper } from './binance-mapper';
import type { BinanceRawTicker, BinanceRawKlineMessage, BinanceSymbolDto, BinanceRawKline } from './binance-types';

@Injectable()
export class BinanceCryptoAdapter implements CryptoDataSourcePort, OnDestroy {
  private readonly REST_BASE = 'https://api.binance.com/api/v3';
  private readonly WS_BASE = 'wss://stream.binance.com:9443/ws';

  private tickerSocket$: WebSocketSubject<BinanceRawTicker[]>;
  private mapper = new BinanceMapper();

  allTickers$: Observable<Ticker[]>;

  private klineSubject = new Subject<Candle>();
  private klineSocket: WebSocketSubject<BinanceRawKlineMessage> | null = null;

  constructor() {
    this.tickerSocket$ = webSocket<BinanceRawTicker[]>({
      url: `${this.WS_BASE}/!miniTicker@arr`,
      deserializer: (msg) => JSON.parse(msg.data) as BinanceRawTicker[],
    });

    this.allTickers$ = this.tickerSocket$.pipe(
      map((rawArray) => rawArray.map((raw) => this.mapper.toTicker(raw))),
      retry({
        count: Infinity,
        delay: (_err, retryCount) => timer(Math.min(1000 * Math.pow(2, retryCount), 30000)),
      }),
      share()
    );
  }

  async getSymbols(): Promise<SymbolInfo[]> {
    const res = await fetch(`${this.REST_BASE}/exchangeInfo`);
    const data = (await res.json()) as { symbols: BinanceSymbolDto[] };
    return data.symbols
      .filter((s) => s.quoteAsset === 'USDT' && s.status === 'TRADING')
      .sort((a, b) => a.baseAsset.localeCompare(b.baseAsset))
      .map((s) => this.mapper.toSymbolInfo(s));
  }

  async fetchKlines(symbol: string, interval = '1m', limit = 100): Promise<Candle[]> {
    const url = `${this.REST_BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url);
    const raw = (await res.json()) as BinanceRawKline[];
    return raw.map((k) => this.mapper.toCandleFromKline(k));
  }

  connectKline(symbol: string): Observable<Candle> {
    this.disconnectKline();

    this.klineSocket = webSocket<BinanceRawKlineMessage>({
      url: `${this.WS_BASE}/${symbol.toLowerCase()}@kline_1m`,
      deserializer: (msg) => JSON.parse(msg.data) as BinanceRawKlineMessage,
    });

    this.klineSocket
      .pipe(
        map((raw) => this.mapper.toCandle(raw)),
        retry({
          count: Infinity,
          delay: (_err, retryCount) => timer(Math.min(1000 * Math.pow(2, retryCount), 30000)),
        }),
      )
      .subscribe((candle) => this.klineSubject.next(candle));

    return this.klineSubject.asObservable();
  }

  disconnectKline(): void {
    if (this.klineSocket) {
      this.klineSocket.complete();
      this.klineSocket = null;
    }
  }

  disconnect(): void {
    this.tickerSocket$?.complete();
    this.disconnectKline();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
