const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsd(value: number) {
  return usdFormatter.format(value);
}

export function formatPercent(value: number) {
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
