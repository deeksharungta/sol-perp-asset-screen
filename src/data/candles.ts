import type { Candle, Timeframe } from "../types/candle";
import { solPerpMarket } from "./market";
import { solDailyCloses } from "./priceHistory";

const CANDLE_COUNT = 40;
const NOW = Date.UTC(2026, 9, 21, 12);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type CandleOptions = {
  startPrice: number;
  interval: number;
  volatility: number;
  seed: number;
};

// Park–Miller: a tiny seeded random generator, so the mock chart looks the same on every launch.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

function roundPrice(price: number) {
  return Math.round(price * 100) / 100;
}

function randomWalk(
  startPrice: number,
  endPrice: number,
  volatility: number,
  random: () => number,
) {
  const prices = [startPrice];
  for (let i = 1; i <= CANDLE_COUNT; i++) {
    const previous = prices[i - 1];
    prices.push(previous + previous * (random() - 0.5) * 2 * volatility);
  }

  // Shift the walk linearly so it still starts on startPrice but ends exactly on endPrice.
  const offset = endPrice - prices[CANDLE_COUNT];
  return prices.map((price, i) => price + (offset * i) / CANDLE_COUNT);
}

function generateCandles({
  startPrice,
  interval,
  volatility,
  seed,
}: CandleOptions) {
  const random = createRandom(seed);
  const prices = randomWalk(
    startPrice,
    solPerpMarket.price,
    volatility,
    random,
  );

  const candles: Candle[] = [];
  for (let i = 1; i <= CANDLE_COUNT; i++) {
    const open = prices[i - 1];
    const close = prices[i];
    const wickSize = volatility * 0.6 * close;
    candles.push({
      time: NOW - (CANDLE_COUNT - i) * interval,
      open: roundPrice(open),
      high: roundPrice(Math.max(open, close) + random() * wickSize),
      low: roundPrice(Math.min(open, close) - random() * wickSize),
      close: roundPrice(close),
    });
  }
  return candles;
}

// 40 candles of about 18h each follow the 30 daily closes,
// so the month view agrees with the post page chart.
function generateMonthCandles() {
  const random = createRandom(4);
  const volatility = 0.015;
  const days = solDailyCloses.length - 1;
  const prices = Array.from({ length: CANDLE_COUNT + 1 }, (_, i) => {
    const day = (i * days) / CANDLE_COUNT;
    const before = solDailyCloses[Math.floor(day)];
    const after = solDailyCloses[Math.ceil(day)];
    const price = before + (after - before) * (day - Math.floor(day));
    return i === CANDLE_COUNT ? price : price + (random() - 0.5) * 0.01 * price;
  });

  const candles: Candle[] = [];
  for (let i = 1; i <= CANDLE_COUNT; i++) {
    const open = prices[i - 1];
    const close = prices[i];
    const wickSize = volatility * 0.6 * close;
    candles.push({
      time: NOW - ((CANDLE_COUNT - i) * days * DAY) / CANDLE_COUNT,
      open: roundPrice(open),
      high: roundPrice(Math.max(open, close) + random() * wickSize),
      low: roundPrice(Math.min(open, close) - random() * wickSize),
      close: roundPrice(close),
    });
  }
  return candles;
}

export const candlesByTimeframe: Record<Timeframe, Candle[]> = {
  "1H": generateCandles({
    startPrice: 170.4,
    interval: 1.5 * MINUTE,
    volatility: 0.0015,
    seed: 1,
  }),
  "1D": generateCandles({
    startPrice: solPerpMarket.openPrice,
    interval: 36 * MINUTE,
    volatility: 0.008,
    seed: 32,
  }),
  "1W": generateCandles({
    startPrice: 158.6,
    interval: 252 * MINUTE,
    volatility: 0.012,
    seed: 3,
  }),
  "1M": generateMonthCandles(),
  "3M": generateCandles({
    startPrice: 196.3,
    interval: 54 * HOUR,
    volatility: 0.03,
    seed: 5,
  }),
  "6M": generateCandles({
    startPrice: 142.8,
    interval: 4.5 * DAY,
    volatility: 0.04,
    seed: 6,
  }),
  "1Y": generateCandles({
    startPrice: 94.5,
    interval: 9 * DAY,
    volatility: 0.05,
    seed: 7,
  }),
  All: generateCandles({
    startPrice: 18.2,
    interval: 45 * DAY,
    volatility: 0.12,
    seed: 8,
  }),
};
