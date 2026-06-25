import { Observable, of } from 'rxjs';
import type { CryptoDataSourcePort } from '../../../core/ports';
import type { Ticker, Candle, SymbolInfo } from '../../../core/domain';

export class MockCryptoAdapter implements CryptoDataSourcePort {
  allTickers$ = of<Ticker[]>([]);

  private symbols: SymbolInfo[] = [
    { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', status: 'TRADING' },
    { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', status: 'TRADING' },
    { symbol: 'USDTMXN', baseAsset: 'USDT', quoteAsset: 'MXN', status: 'TRADING' },
  ];

  private candles: Candle[] = Array.from({ length: 50 }, (_, i) => ({
    time: Date.now() - (50 - i) * 60000,
    open: 50000 + Math.random() * 1000,
    high: 51000 + Math.random() * 500,
    low: 49000 + Math.random() * 500,
    close: 50000 + Math.random() * 1000,
    volume: Math.random() * 100,
  }));

  async getSymbols(): Promise<SymbolInfo[]> {
    return this.symbols;
  }

  async fetchKlines(_symbol: string, _interval?: string, _limit?: number): Promise<Candle[]> {
    return this.candles;
  }

  connectKline(_symbol: string): Observable<Candle> {
    return of<Candle>({
      time: Date.now(),
      open: 50000,
      high: 50100,
      low: 49900,
      close: 50050,
      volume: 50,
    });
  }

  disconnectKline(): void {}
  disconnect(): void {}
}
