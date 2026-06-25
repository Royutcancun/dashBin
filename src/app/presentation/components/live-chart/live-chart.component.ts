import { Component, input, viewChild, afterRenderEffect, inject, DestroyRef, ElementRef } from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import type { Candle } from '../../../core/domain';

@Component({
  selector: 'app-live-chart',
  standalone: true,
  template: '<div #chartContainer class="w-full h-full"></div>',
})
export class LiveChartComponent {
  readonly data = input<Candle[]>([]);
  private chartContainer = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');
  private rendered = false;

  private readonly layout: Partial<Plotly.Layout> = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 10, r: 10, b: 30, l: 50 },
    font: { color: '#9ca3af', size: 10 },
    dragmode: 'zoom',
    xaxis: {
      type: 'date',
      showgrid: false,
      zeroline: false,
      tickformat: '%H:%M',
    },
    yaxis: {
      type: 'linear',
      showgrid: true,
      gridcolor: '#374151',
      zeroline: false,
      tickprefix: '$',
    },
    showlegend: false,
  };

  private readonly trace: Partial<Plotly.PlotData> = {
    type: 'candlestick',
    x: [],
    open: [],
    high: [],
    low: [],
    close: [],
    increasing: { line: { color: '#22c55e' }, fillcolor: '#22c55e' },
    decreasing: { line: { color: '#ef4444' }, fillcolor: '#ef4444' },
    name: 'Price',
  };

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterRenderEffect({
      write: () => {
        const candles = this.data();
        if (candles.length === 0) return;

        const el = this.chartContainer().nativeElement;
        if (!this.rendered) {
          this.rendered = true;
          void Plotly.newPlot(el, [this.buildTrace(candles)], this.layout, {
            responsive: true,
            displayModeBar: false,
          });
        } else {
          void Plotly.react(el, [this.buildTrace(candles)], this.layout, {
            responsive: true,
            displayModeBar: false,
          });
        }
      },
    });

    destroyRef.onDestroy(() => {
      const container = this.chartContainer();
      if (container) {
        void Plotly.purge(container.nativeElement);
      }
    });
  }

  private buildTrace(data: Candle[]): Partial<Plotly.PlotData> {
    return {
      ...this.trace,
      x: data.map((c) => c.time),
      open: data.map((c) => c.open),
      high: data.map((c) => c.high),
      low: data.map((c) => c.low),
      close: data.map((c) => c.close),
    };
  }
}
