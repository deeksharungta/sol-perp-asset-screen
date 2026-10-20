export function priceToY(
  price: number,
  minPrice: number,
  maxPrice: number,
  height: number,
) {
  "worklet";
  return height - ((price - minPrice) / (maxPrice - minPrice)) * height;
}

export function indexToX(index: number, candleStep: number) {
  "worklet";
  return index * candleStep + candleStep / 2;
}
