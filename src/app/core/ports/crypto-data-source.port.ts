import { Observable } from 'rxjs';
import type { Ticker, Candle, SymbolInfo } from '../domain';

export interface CryptoDataSourcePort {
  allTickers$: Observable<Ticker[]>;
  getSymbols(): Promise<SymbolInfo[]>;
  fetchKlines(symbol: string, interval?: string, limit?: number): Promise<Candle[]>;
  connectKline(symbol: string): Observable<Candle>;
  disconnectKline(): void;
  disconnect(): void;
}
