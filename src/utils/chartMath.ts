import type { Candle } from "../types/candle";

const TARGET_LABEL_STEPS = 4;

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

// Rounds the step up to 1, 2 or 5 × 10^n, so labels read like $160, $165, $170.
export function niceStep(range: number) {
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

  const step = niceStep(high - low);
  return {
    minPrice: Math.floor(low / step) * step,
    maxPrice: Math.ceil(high / step) * step,
    step,
  };
}
