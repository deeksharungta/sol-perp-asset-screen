import { useEffect } from "react";
import {
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";

const TICK_INTERVAL = 500;
const MAX_TICK_CHANGE = 0.0003;
const PULL_TO_BASE = 0.1;
const CHASE_TIME = 150;
const SETTLED_DISTANCE = 0.001;

export function useLivePrice(basePrice: number) {
  const livePrice = useSharedValue(basePrice);
  const targetPrice = useSharedValue(basePrice);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    let price = basePrice;
    const interval = setInterval(() => {
      const randomStep = (Math.random() - 0.5) * 2 * MAX_TICK_CHANGE * price;
      price += randomStep + (basePrice - price) * PULL_TO_BASE;
      targetPrice.set(price);
    }, TICK_INTERVAL);
    return () => clearInterval(interval);
  }, [basePrice, targetPrice]);

  // Eases toward the newest price every frame, and stops writing once it has caught up.
  useFrameCallback((frame) => {
    const distance = targetPrice.get() - livePrice.get();
    if (Math.abs(distance) < SETTLED_DISTANCE) {
      return;
    }
    if (isReducedMotion) {
      livePrice.set(targetPrice.get());
      return;
    }
    const elapsed = frame.timeSincePreviousFrame ?? 16;
    livePrice.set(
      livePrice.get() + distance * (1 - Math.exp(-elapsed / CHASE_TIME)),
    );
  });

  return livePrice;
}
