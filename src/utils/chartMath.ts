import type { SkPathBuilder } from "@shopify/react-native-skia";

import type { Candle } from "../types/candle";

const TARGET_LABEL_STEPS = 4;
const PRICE_PADDING = 0.15;

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
