import { useEffect } from "react";
import {
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { livePulseTiming } from "../theme/animations";
import type { ChartType } from "../types/candle";

export function useLivePulse(chartType: ChartType) {
  const livePulse = useSharedValue(0);

  useEffect(() => {
    livePulse.value =
      chartType === "line" ? withRepeat(withTiming(1, livePulseTiming), -1) : 0;
  }, [chartType, livePulse]);

  return livePulse;
}
