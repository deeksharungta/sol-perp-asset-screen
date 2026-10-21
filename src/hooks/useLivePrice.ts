import { useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

import { priceTickTiming } from "../theme/animations";

const TICK_INTERVAL = 1000;
const MAX_TICK_CHANGE = 0.0005;
const PULL_TO_BASE = 0.1;

export function useLivePrice(basePrice: number) {
  const livePrice = useSharedValue(basePrice);

  useEffect(() => {
    let price = basePrice;
    const interval = setInterval(() => {
      const randomStep = (Math.random() - 0.5) * 2 * MAX_TICK_CHANGE * price;
      price += randomStep + (basePrice - price) * PULL_TO_BASE;
      livePrice.value = withTiming(price, priceTickTiming);
    }, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [basePrice, livePrice]);

  return livePrice;
}
