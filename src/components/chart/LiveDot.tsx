import { Circle } from "@shopify/react-native-skia";
import { useEffect } from "react";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { livePulseTiming } from "../../theme/animations";
import type { ChartType } from "../../types/candle";

const END_DOT_RADIUS = 3;
const LIVE_PULSE_RADIUS = 14;
const LIVE_PULSE_OPACITY = 0.3;

type LiveDotProps = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  color: SharedValue<string>;
  chartType: ChartType;
};

export function LiveDot({ x, y, color, chartType }: LiveDotProps) {
  const livePulse = useSharedValue(0);

  useEffect(() => {
    livePulse.value =
      chartType === "line" ? withRepeat(withTiming(1, livePulseTiming), -1) : 0;
  }, [chartType, livePulse]);

  const pulseRadius = useDerivedValue(
    () =>
      END_DOT_RADIUS + (LIVE_PULSE_RADIUS - END_DOT_RADIUS) * livePulse.value,
  );
  const pulseOpacity = useDerivedValue(
    () => LIVE_PULSE_OPACITY * (1 - livePulse.value),
  );

  return (
    <>
      <Circle
        cx={x}
        cy={y}
        r={pulseRadius}
        color={color}
        opacity={pulseOpacity}
      />
      <Circle cx={x} cy={y} r={END_DOT_RADIUS} color={color} />
    </>
  );
}
