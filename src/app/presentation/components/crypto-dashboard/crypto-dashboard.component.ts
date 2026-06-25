import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardManagerService } from '../../../application/dashboard-manager.service';
import { LiveChartComponent } from '../live-chart/live-chart.component';
import type { Ticker } from '../../../core/domain';

@Component({
  selector: 'app-crypto-dashboard',
  standalone: true,
  imports: [LiveChartComponent, FormsModule],
  templateUrl: './crypto-dashboard.component.html',
})
export class CryptoDashboardComponent {
  private dashboard = inject(DashboardManagerService);

  readonly searchTerm = signal('');
  readonly sidebarOpen = signal(false);

  readonly state = this.dashboard;

  readonly filteredSymbols = computed(() => {
    const term = this.searchTerm().toUpperCase();
    const list = this.state.allTickerList();
    if (!term) return list;
    return list.filter((t) => t.symbol.includes(term));
  });

  async selectSymbol(symbol: string): Promise<void> {
    await this.state.setSymbol(symbol);
    this.sidebarOpen.set(false);
  }

  formatSymbol(symbol: string): string {
    return symbol.replace('USDT', '');
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  mxnPrice(ticker: Ticker): number {
    return ticker.price * this.state.usdMxnRate();
  }

  formatPrice(price: number): string {
    if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  }

  formatMxn(price: number): string {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  trackSymbol(_index: number, ticker: { symbol: string }): string {
    return ticker.symbol;
  }
}
