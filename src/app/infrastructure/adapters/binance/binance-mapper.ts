import type { Ticker, Candle, SymbolInfo } from '../../../core/domain';
import type { BinanceRawTicker, BinanceRawKlineMessage, BinanceSymbolDto, BinanceRawKline } from './binance-types';

export class BinanceMapper {
  toTicker(raw: BinanceRawTicker): Ticker {
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

  toCandle(raw: BinanceRawKlineMessage): Candle {
    return {
      time: raw.k.t,
      open: parseFloat(raw.k.o),
      high: parseFloat(raw.k.h),
      low: parseFloat(raw.k.l),
      close: parseFloat(raw.k.c),
      volume: parseFloat(raw.k.v),
    };
  }

  toCandleFromKline(raw: BinanceRawKline): Candle {
    return {
      time: raw[0] as number,
      open: parseFloat(raw[1] as string),
      high: parseFloat(raw[2] as string),
      low: parseFloat(raw[3] as string),
      close: parseFloat(raw[4] as string),
      volume: parseFloat(raw[5] as string),
    };
  }

  toSymbolInfo(raw: BinanceSymbolDto): SymbolInfo {
    return {
      symbol: raw.symbol,
      baseAsset: raw.baseAsset,
      quoteAsset: raw.quoteAsset,
      status: raw.status,
    };
  }
}
