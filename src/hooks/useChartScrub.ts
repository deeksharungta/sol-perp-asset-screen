import * as Haptics from "expo-haptics";
import { usePanGesture } from "react-native-gesture-handler";
import {
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { scrubFadeTiming, scrubGlideTiming } from "../theme/animations";
import type { Candle } from "../types/candle";
import { clamp, xToIndex } from "../utils/chartMath";

const SCRUB_ACTIVATION_DISTANCE = 8;

type ChartScrubOptions = {
  candles: Candle[];
  candleStep: SharedValue<number>;
  plotWidth: SharedValue<number>;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
};

export function useChartScrub({
  candles,
  candleStep,
  plotWidth,
  scrubIndex,
  scrubProgress,
}: ChartScrubOptions) {
  const candleCount = candles.length;
  const scrubX = useSharedValue(0);
  const scrubPrice = useSharedValue(candles[candleCount - 1].close);

  const scrubGesture = usePanGesture({
    activeOffsetX: [-SCRUB_ACTIVATION_DISTANCE, SCRUB_ACTIVATION_DISTANCE],
    failOffsetY: [-SCRUB_ACTIVATION_DISTANCE, SCRUB_ACTIVATION_DISTANCE],
    onActivate: (event) => {
      const index = xToIndex(event.x, candleStep.value, candleCount);
      scrubX.set(clamp(event.x, 0, plotWidth.value));
      scrubIndex.set(index);
      scrubPrice.set(candles[index].close);
      scrubProgress.set(withTiming(1, scrubFadeTiming));
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    },
    onUpdate: (event) => {
      scrubX.set(clamp(event.x, 0, plotWidth.value));
      const index = xToIndex(event.x, candleStep.value, candleCount);
      if (index !== scrubIndex.value) {
        scrubIndex.set(index);
        scrubPrice.set(withTiming(candles[index].close, scrubGlideTiming));
        scheduleOnRN(Haptics.selectionAsync);
      }
    },
    onDeactivate: () => {
      scrubProgress.set(withTiming(0, scrubFadeTiming));
    },
  });

  return { scrubGesture, scrubX, scrubPrice };
}
