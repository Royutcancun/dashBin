import { Component } from '@angular/core';
import { CryptoDashboardComponent } from './presentation/components/crypto-dashboard/crypto-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CryptoDashboardComponent],
  template: '<app-crypto-dashboard />',
})
export class AppComponent {}
