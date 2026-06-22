export interface BinanceRawTicker {
  e: string;
  E: number;
  s: string;
  c: string;
  o: string;
  h: string;
  l: string;
  v: string;
  q: string;
}

export interface BinanceTicker {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
  eventTime: number;
  change24h: number;
  change24hPercent: number;
}

export interface PricePoint {
  time: number;
  price: number;
}

export interface BinanceSymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export interface ExchangeInfoResponse {
  symbols: BinanceSymbolInfo[];
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BinanceRawKlineMessage {
  e: string;
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
  };
}
