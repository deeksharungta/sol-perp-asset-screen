import { Skia, type SkPathBuilder } from "@shopify/react-native-skia";

import type { Candle } from "../types/candle";

const TARGET_LABEL_STEPS = 4;
const PRICE_PADDING = 0.15;
const CANDLE_GAP = 1.5;
const WICK_WIDTH = 1;
const DRAW_IN_SPREAD = 10;

type Point = {
  x: number;
  y: number;
};

export function priceToY(
  price: number,
  minPrice: number,
  maxPrice: number,
  height: number,
) {
  "worklet";
  return height - ((price - minPrice) / (maxPrice - minPrice)) * height;
}

export function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

export function indexToX(index: number, candleStep: number) {
  "worklet";
  return index * candleStep + candleStep / 2;
}

export function xToIndex(x: number, candleStep: number, candleCount: number) {
  "worklet";
  return clamp(Math.floor(x / candleStep), 0, candleCount - 1);
}

// Catmull-Rom curve through every point, drawn as cubic Béziers, so the line bends instead of zig-zagging.
export function addSmoothLine(path: SkPathBuilder, points: Point[]) {
  "worklet";
  points.forEach((point, index) => {
    if (index === 0) {
      path.moveTo(point.x, point.y);
      return;
    }
    const start = points[index - 1];
    const before = points[index - 2] ?? start;
    const after = points[index + 1] ?? point;
    path.cubicTo(
      start.x + (point.x - before.x) / 6,
      start.y + (point.y - before.y) / 6,
      point.x - (after.x - start.x) / 6,
      point.y - (after.y - start.y) / 6,
      point.x,
      point.y,
    );
  });
}

// Rounds the step up to 1, 2 or 5 × 10^n, so labels read like $160, $165, $170.
function niceStep(range: number) {
  "worklet";
  const roughStep = range / TARGET_LABEL_STEPS;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

export type PriceRange = ReturnType<typeof getPriceRange>;

export function getPriceRange(candles: Candle[]) {
  "worklet";
  let low = Infinity;
  let high = -Infinity;
  for (const candle of candles) {
    low = Math.min(low, candle.low);
    high = Math.max(high, candle.high);
  }
  const padding = (high - low) * PRICE_PADDING;
  low -= padding;
  high += padding;

  const step = niceStep(high - low);
  return {
    minPrice: Math.floor(low / step) * step,
    maxPrice: Math.ceil(high / step) * step,
    step,
  };
}

type ChartSizes = {
  candleStep: number;
  plotHeight: number;
  minPrice: number;
  maxPrice: number;
  zoom: number;
};

type ChartProgress = {
  draw: number;
  line: number;
};

export function buildChartPaths(
  candles: Candle[],
  livePrice: number,
  { candleStep, plotHeight, minPrice, maxPrice, zoom }: ChartSizes,
  progress: ChartProgress,
) {
  "worklet";
  const candleCount = candles.length;
  const bodyWidth = candleStep * Math.min(zoom, 1) - CANDLE_GAP;
  const lastX = indexToX(candleCount - 1, candleStep);
  const toX = (index: number) =>
    lastX - (lastX - indexToX(index, candleStep)) * zoom;

  const greenCandles = Skia.PathBuilder.Make();
  const redCandles = Skia.PathBuilder.Make();
  const closePoints: Point[] = [];

  candles.forEach((candle, index) => {
    const x = toX(index);
    const isLiveCandle = index === candleCount - 1;
    const close = isLiveCandle ? livePrice : candle.close;
    const high = isLiveCandle ? Math.max(candle.high, close) : candle.high;
    const low = isLiveCandle ? Math.min(candle.low, close) : candle.low;
    const closeY = priceToY(close, minPrice, maxPrice, plotHeight);
    closePoints.push({ x, y: closeY });

    const reveal =
      clamp(
        progress.draw * (candleCount + DRAW_IN_SPREAD) - index,
        0,
        DRAW_IN_SPREAD,
      ) / DRAW_IN_SPREAD;
    if (reveal === 0 || progress.line === 1) {
      return;
    }

    const collapse = (y: number) => y + (closeY - y) * progress.line;
    const highY = collapse(priceToY(high, minPrice, maxPrice, plotHeight));
    const lowY = collapse(priceToY(low, minPrice, maxPrice, plotHeight));
    const middleY = (highY + lowY) / 2;
    const grow = (y: number) => middleY + (y - middleY) * reveal;
    const openY = collapse(
      priceToY(candle.open, minPrice, maxPrice, plotHeight),
    );

    const path = close >= candle.open ? greenCandles : redCandles;
    path.addRect({
      x: x - bodyWidth / 2,
      y: grow(Math.min(openY, closeY)),
      width: bodyWidth,
      height: Math.max(1, Math.abs(closeY - openY) * reveal),
    });
    path.addRect({
      x: x - WICK_WIDTH / 2,
      y: grow(highY),
      width: WICK_WIDTH,
      height: (lowY - highY) * reveal,
    });
  });

  const closeLine = Skia.PathBuilder.Make();
  const closeArea = Skia.PathBuilder.Make();
  if (progress.line > 0) {
    addSmoothLine(closeLine, closePoints);
    addSmoothLine(closeArea, closePoints);
    closeArea.lineTo(lastX, plotHeight).lineTo(toX(0), plotHeight).close();
  }

  return {
    greenCandles: greenCandles.detach(),
    redCandles: redCandles.detach(),
    closeLine: closeLine.detach(),
    closeArea: closeArea.detach(),
  };
}

export type ChartPaths = ReturnType<typeof buildChartPaths>;
