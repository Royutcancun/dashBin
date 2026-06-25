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

export interface BinanceSymbolDto {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export type BinanceRawKline = Array<number | string>;
