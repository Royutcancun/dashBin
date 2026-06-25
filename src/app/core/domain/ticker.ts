export interface Ticker {
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
