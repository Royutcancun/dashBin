import { Injectable, OnDestroy, signal, computed, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { CRYPTO_DATA_SOURCE } from '../core/ports';
import type { CryptoDataSourcePort } from '../core/ports';
import type { Ticker, Candle } from '../core/domain';

@Injectable({ providedIn: 'root' })
export class DashboardManagerService implements OnDestroy {
  private dataSource = inject<CryptoDataSourcePort>(CRYPTO_DATA_SOURCE);

  private tickerMap = new Map<string, Ticker>();
  private candleMap = new Map<number, Candle>();
  private tickerSub: Subscription;
  private klineSub: Subscription | null = null;

  private readonly tv = signal(0);

  private readonly _selectedSymbol = signal('BTCUSDT');
  readonly selectedSymbol = this._selectedSymbol.asReadonly();

  readonly allTickerList = computed(() => {
    this.tv();
    return Array.from(this.tickerMap.values())
      .filter((t) => t.symbol.endsWith('USDT') && t.symbol !== 'USDTUSDT')
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  });

  readonly currentTicker = computed(() => {
    this.tv();
    return this.tickerMap.get(this._selectedSymbol()) ?? null;
  });

  private readonly _candles = signal<Candle[]>([]);
  readonly candles = this._candles.asReadonly();

  private readonly _lastPrice = signal(0);
  readonly lastPrice = this._lastPrice.asReadonly();

  readonly usdMxnRate = computed(() => {
    this.tv();
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

  constructor() {
    this.dataSource.getSymbols().catch(() => {});

    this.tickerSub = this.dataSource.allTickers$.subscribe((tickers) => {
      const oldTicker = this.currentTicker();

      for (const t of tickers) {
        this.tickerMap.set(t.symbol, t);
      }

      if (oldTicker) {
        this._lastPrice.set(oldTicker.price);
      }

      this.tv.update((v) => v + 1);
    });

    this.connectToKline(this.selectedSymbol());
    this.fetchInitialKlines(this.selectedSymbol());
  }

  async setSymbol(symbol: string): Promise<void> {
    this._selectedSymbol.set(symbol);
    this.candleMap.clear();
    this._candles.set([]);
    this._lastPrice.set(0);

    this.fetchInitialKlines(symbol);
    this.connectToKline(symbol);
  }

  private connectToKline(symbol: string): void {
    this.klineSub?.unsubscribe();
    this.klineSub = this.dataSource.connectKline(symbol).subscribe((candle) => {
      this.candleMap.set(candle.time, candle);
      this.flushCandles();
    });
  }

  private flushCandles(): void {
    const sorted = Array.from(this.candleMap.values()).sort((a, b) => a.time - b.time);
    if (sorted.length > 100) {
      for (let i = 0; i < sorted.length - 100; i++) {
        this.candleMap.delete(sorted[i].time);
      }
    }
    this._candles.set(sorted.slice(-100));
  }

  private async fetchInitialKlines(symbol: string): Promise<void> {
    try {
      const history = await this.dataSource.fetchKlines(symbol);
      for (const c of history) {
        this.candleMap.set(c.time, c);
      }
      this._candles.set(this.candleMap.size > 0 ? Array.from(this.candleMap.values()).sort((a, b) => a.time - b.time) : history);
    } catch {
      console.warn(`Failed to fetch kline history for ${symbol}`);
    }
  }

  ngOnDestroy(): void {
    this.tickerSub?.unsubscribe();
    this.klineSub?.unsubscribe();
    this.dataSource.disconnectKline();
  }
}
