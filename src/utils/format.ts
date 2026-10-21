import type { Timeframe } from "../types/candle";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(value: number) {
  return usdFormatter.format(value);
}

// Intl isn't available on the UI thread, so chart readouts use this while scrubbing.
export function formatPrice(price: number) {
  "worklet";
  return `$${price.toFixed(2)}`;
}

export function formatPriceChange(price: number, basePrice: number) {
  "worklet";
  const difference = price - basePrice;
  const percent = (difference / basePrice) * 100;
  return `${formatPrice(Math.abs(difference))} (${Math.abs(percent).toFixed(2)}%)`;
}

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
});

export function formatShortDate(time: number) {
  return dateFormatter.format(time);
}

export function formatCandleTime(time: number, timeframe: Timeframe) {
  if (timeframe === "1H" || timeframe === "1D") {
    return timeFormatter.format(time);
  }
  if (timeframe === "1W" || timeframe === "1M") {
    return dateTimeFormatter.format(time);
  }
  if (timeframe === "All") {
    return monthFormatter.format(time);
  }
  return dateFormatter.format(time);
}

export function formatPercent(value: number) {
  "worklet";
  return `${value.toFixed(2)}%`;
}

export function formatSignedUsd(value: number) {
  return `${value < 0 ? "-" : "+"}${formatUsd(Math.abs(value))}`;
}

// Number() drops trailing zeros, so 1.20 shows as "$1.2M" like the Figma.
export function formatCompactUsd(value: number) {
  if (value >= 1_000_000_000) {
    return `$${Number((value / 1_000_000_000).toFixed(2))}B`;
  }
  if (value >= 1_000_000) {
    return `$${Number((value / 1_000_000).toFixed(2))}M`;
  }
  if (value >= 1_000) {
    return `$${Number((value / 1_000).toFixed(2))}K`;
  }
  return formatUsd(value);
}
