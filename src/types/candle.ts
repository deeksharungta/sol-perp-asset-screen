export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export const timeframes = [
  "1H",
  "1D",
  "1W",
  "1M",
  "3M",
  "6M",
  "1Y",
  "All",
] as const;

export type Timeframe = (typeof timeframes)[number];

export type ChartType = "candles" | "line";
