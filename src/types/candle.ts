export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Timeframe = "1H" | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "All";

export type ChartType = "candles" | "line";
