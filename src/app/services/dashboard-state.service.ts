import { Injectable, OnDestroy, signal, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { BinanceWebsocketService } from './binance-websocket.service';
import { BinanceTicker, Candle } from '../models/types';

@Injectable({ providedIn: 'root' })
export class DashboardStateService implements OnDestroy {
  private tickerSub: Subscription;
  private klineSub: Subscription;
  private tickerMap = new Map<string, BinanceTicker>();
  private candleMap = new Map<number, Candle>();

  readonly selectedSymbol = signal('BTCUSDT');
  readonly allTickerList = signal<BinanceTicker[]>([]);
  readonly currentTicker = computed(() => this.tickerMap.get(this.selectedSymbol()) ?? null);
  readonly candles = signal<Candle[]>([]);
  readonly lastPrice = signal(0);

  readonly usdMxnRate = computed<number>(() => {
    return this.tickerMap.get('USDTMXN')?.price ?? 0;
  });

  readonly priceDirection = computed(() => {
    const current = this.currentTicker()?.price ?? 0;
    const prev = this.lastPrice();
    if (current > prev) return 'up';
    if (current < prev) return 'down';
    return 'neutral';
  });

  readonly priceChangePercent = computed(() => this.currentTicker()?.change24hPercent ?? 0);

  constructor(private ws: BinanceWebsocketService) {
    this.tickerSub = this.ws.allTickers$.subscribe((tickers) => {
      for (const t of tickers) {
        this.tickerMap.set(t.symbol, t);
      }

      const selected = this.tickerMap.get(this.selectedSymbol());
      if (selected) {
        this.lastPrice.set(this.currentTicker()?.price ?? 0);
      }

      const usdtList = tickers
        .filter((t) => t.symbol.endsWith('USDT') && t.symbol !== 'USDTUSDT')
        .sort((a, b) => a.symbol.localeCompare(b.symbol));
      this.allTickerList.set(usdtList);
    });

    this.klineSub = this.ws.kline$.subscribe((candle) => {
      this.candleMap.set(candle.time, candle);
      const sorted = Array.from(this.candleMap.values()).sort((a, b) => a.time - b.time);
      if (sorted.length > 100) {
        this.candleMap.delete(sorted[0].time);
      }
      this.candles.set(sorted.slice(-100));
    });
  }

  async setSymbol(symbol: string): Promise<void> {
    this.selectedSymbol.set(symbol);
    this.candleMap.clear();
    this.candles.set([]);

    try {
      const history = await this.ws.fetchKlines(symbol);
      for (const c of history) {
        this.candleMap.set(c.time, c);
      }
      this.candles.set(history);
    } catch {
      console.warn(`Failed to fetch kline history for ${symbol}`);
    }

    this.ws.connectKline(symbol);
  }

  ngOnDestroy(): void {
    this.tickerSub?.unsubscribe();
    this.klineSub?.unsubscribe();
    this.ws.disconnectKline();
  }
}
