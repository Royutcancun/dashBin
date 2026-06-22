declare module 'plotly.js-dist-min' {
  type Axis = Partial<{
    type: 'date' | 'linear' | 'log';
    showgrid: boolean;
    zeroline: boolean;
    tickformat: string;
    gridcolor: string;
    tickprefix: string;
    title: Partial<{ text: string }>;
  }>;

  type Layout = Partial<{
    paper_bgcolor: string;
    plot_bgcolor: string;
    margin: Partial<{ t: number; r: number; b: number; l: number }>;
    font: Partial<{ color: string; size: number }>;
    xaxis: Axis;
    yaxis: Axis;
    showlegend: boolean;
    dragmode: string;
  }>;

  type CandleLine = Partial<{ color: string; width: number }>;

  type PlotData = Partial<{
    type: 'scatter' | 'bar' | 'line' | 'candlestick';
    mode: 'lines' | 'markers' | 'lines+markers';
    line: CandleLine;
    fill: 'tozeroy' | 'none';
    fillcolor: string;
    hovertemplate: string;
    x: number[] | string[];
    y: number[];
    open: number[];
    high: number[];
    low: number[];
    close: number[];
    name: string;
    increasing: Partial<{ line: CandleLine; fillcolor: string }>;
    decreasing: Partial<{ line: CandleLine; fillcolor: string }>;
  }>;

  type Config = Partial<{
    responsive: boolean;
    displayModeBar: boolean;
  }>;

  export function newPlot(
    container: HTMLElement,
    data: PlotData[],
    layout?: Layout,
    config?: Config,
  ): Promise<any>;

  export function react(
    container: HTMLElement,
    data: PlotData[],
    layout?: Layout,
    config?: Config,
  ): Promise<any>;

  export function purge(container: HTMLElement): void;
}
