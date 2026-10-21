import { Circle } from "@shopify/react-native-skia";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

import { useLivePulse } from "../../hooks/useLivePulse";
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
  const livePulse = useLivePulse(chartType);
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
