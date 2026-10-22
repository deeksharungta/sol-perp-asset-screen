import type { Candle, Timeframe } from "../types/candle";
import { solPerpMarket } from "./market";

// Has to divide 120: 1H is 120 thirty-second steps, so every bucket holds whole steps.
const CANDLE_COUNT = 40;
const NOW = Date.now();
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const LONG_STEP = 6 * HOUR;
const FINE_STEP = 30 * SECOND;
const HISTORY_SPAN = 1800 * DAY;
const DETAIL_SPAN = 30 * DAY;
const START_PRICE = 18.2;
const LONG_VOLATILITY = 0.015;
const LONG_SEED = 20;
const FINE_SEED = 2;

// Park–Miller: a tiny seeded random generator, so the mock chart looks the same on every launch.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

// Standard normal noise from two uniform draws (Box–Muller).
function createGaussian(random: () => number) {
  return () =>
    Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
}

function roundPrice(price: number) {
  return Math.round(price * 100) / 100;
}

// A log-price walk in 6-hour steps, bent linearly between pins so it hits each pinned price exactly.
function buildLongHistory() {
  const gaussian = createGaussian(createRandom(LONG_SEED));
  const stepCount = HISTORY_SPAN / LONG_STEP;
  const logPrices = [Math.log(START_PRICE)];
  for (let i = 1; i <= stepCount; i++) {
    logPrices.push(logPrices[i - 1] + gaussian() * LONG_VOLATILITY);
  }

  const pins = [
    { index: 0, price: START_PRICE },
    { index: stepCount - DAY / LONG_STEP, price: solPerpMarket.openPrice },
    { index: stepCount, price: solPerpMarket.price },
  ];
  const offsets = pins.map((pin) => Math.log(pin.price) - logPrices[pin.index]);
  return logPrices.map((logPrice, i) => {
    const end = Math.max(
      1,
      pins.findIndex((pin) => pin.index >= i),
    );
    const start = end - 1;
    const t = (i - pins[start].index) / (pins[end].index - pins[start].index);
    return Math.exp(
      logPrice + offsets[start] + (offsets[end] - offsets[start]) * t,
    );
  });
}

// Fills the last 30 days with 30-second steps, a Brownian bridge between each pair of 6-hour points.
function buildFineHistory(longHistory: number[]) {
  const gaussian = createGaussian(createRandom(FINE_SEED));
  const stepsPerGap = LONG_STEP / FINE_STEP;
  const stepVolatility = LONG_VOLATILITY / Math.sqrt(stepsPerGap);
  const firstGap = longHistory.length - 1 - DETAIL_SPAN / LONG_STEP;

  const prices = [longHistory[firstGap]];
  for (let gap = firstGap; gap < longHistory.length - 1; gap++) {
    const startLog = Math.log(longHistory[gap]);
    const endLog = Math.log(longHistory[gap + 1]);
    const walk = [0];
    for (let k = 1; k <= stepsPerGap; k++) {
      walk.push(walk[k - 1] + gaussian() * stepVolatility);
    }
    for (let k = 1; k < stepsPerGap; k++) {
      const t = k / stepsPerGap;
      const bridge = walk[k] - t * walk[stepsPerGap];
      prices.push(Math.exp(startLog + (endLog - startLog) * t + bridge));
    }
    prices.push(longHistory[gap + 1]);
  }
  return prices;
}

const longHistory = buildLongHistory();
const fineHistory = buildFineHistory(longHistory);

function pricesBetween(start: number, end: number) {
  const isRecent = start >= NOW - DETAIL_SPAN;
  const series = isRecent ? fineHistory : longHistory;
  const step = isRecent ? FINE_STEP : LONG_STEP;
  const last = series.length - 1;
  return series.slice(
    last - (NOW - start) / step,
    last - (NOW - end) / step + 1,
  );
}

function buildCandles(span: number) {
  const bucketSpan = span / CANDLE_COUNT;
  return Array.from({ length: CANDLE_COUNT }, (_, i): Candle => {
    const end = NOW - (CANDLE_COUNT - 1 - i) * bucketSpan;
    const bucket = pricesBetween(end - bucketSpan, end);
    return {
      time: end,
      open: roundPrice(bucket[0]),
      high: roundPrice(Math.max(...bucket)),
      low: roundPrice(Math.min(...bucket)),
      close: roundPrice(bucket[bucket.length - 1]),
    };
  });
}

export const candlesByTimeframe: Record<Timeframe, Candle[]> = {
  "1H": buildCandles(HOUR),
  "1D": buildCandles(DAY),
  "1W": buildCandles(7 * DAY),
  "1M": buildCandles(DETAIL_SPAN),
  "3M": buildCandles(90 * DAY),
  "6M": buildCandles(180 * DAY),
  "1Y": buildCandles(360 * DAY),
  All: buildCandles(HISTORY_SPAN),
};
