import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import * as Plotly from 'plotly.js-dist-min';
import { Candle } from '../../models/types';

@Component({
  selector: 'app-live-chart',
  standalone: true,
  template: '<div #chartContainer class="w-full h-full"></div>',
})
export class LiveChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;
  @Input() data: Candle[] = [];

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

  ngAfterViewInit(): void {
    this.rendered = true;
    if (this.data.length > 0) {
      this.renderChart();
    }
  }

  ngOnChanges(_changes: SimpleChanges): void {
    if (this.rendered) {
      if (this.data.length > 0) {
        this.updateChart();
      }
    }
  }

  private renderChart(): void {
    void Plotly.newPlot(
      this.chartContainer.nativeElement,
      [this.buildTrace()],
      this.layout,
      { responsive: true, displayModeBar: false }
    );
  }

  private updateChart(): void {
    void Plotly.react(
      this.chartContainer.nativeElement,
      [this.buildTrace()],
      this.layout,
      { responsive: true, displayModeBar: false }
    );
  }

  private buildTrace(): Partial<Plotly.PlotData> {
    return {
      ...this.trace,
      x: this.data.map((c) => c.time),
      open: this.data.map((c) => c.open),
      high: this.data.map((c) => c.high),
      low: this.data.map((c) => c.low),
      close: this.data.map((c) => c.close),
    };
  }

  ngOnDestroy(): void {
    if (this.chartContainer?.nativeElement) {
      void Plotly.purge(this.chartContainer.nativeElement);
    }
  }
}
