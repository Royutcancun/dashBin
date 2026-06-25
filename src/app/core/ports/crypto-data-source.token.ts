import { InjectionToken } from '@angular/core';
import type { CryptoDataSourcePort } from './crypto-data-source.port';

export const CRYPTO_DATA_SOURCE = new InjectionToken<CryptoDataSourcePort>(
  'CryptoDataSourcePort'
);
