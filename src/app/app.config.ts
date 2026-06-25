import { ApplicationConfig } from '@angular/core';
import { provideCryptoDataSource } from './infrastructure/config/crypto-data-source.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    ...provideCryptoDataSource(),
  ],
};
