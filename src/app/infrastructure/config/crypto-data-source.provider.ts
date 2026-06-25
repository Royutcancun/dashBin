import { Provider } from '@angular/core';
import { CRYPTO_DATA_SOURCE } from '../../core/ports';
import { BinanceCryptoAdapter } from '../adapters/binance/binance-crypto.adapter';
// import { MockCryptoAdapter } from '../adapters/mock/mock-crypto.adapter';

export function provideCryptoDataSource(): Provider[] {
  return [
    { provide: CRYPTO_DATA_SOURCE, useClass: BinanceCryptoAdapter },
  ];
}

// Para usar mock en desarrollo/testing, cambiar a:
// { provide: CRYPTO_DATA_SOURCE, useClass: MockCryptoAdapter },
