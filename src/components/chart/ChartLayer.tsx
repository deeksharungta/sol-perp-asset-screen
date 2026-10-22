import { Group, LinearGradient, Path, vec } from "@shopify/react-native-skia";
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { colors } from "../../theme/colors";
import type { ChartPaths } from "../../utils/chartMath";

const LINE_WIDTH = 2;
const AREA_OPACITY = 0.24;

type ChartLayerProps = {
  paths: SharedValue<ChartPaths>;
  isUp: boolean;
  opacity: SharedValue<number>;
  lineProgress: SharedValue<number>;
  lineOpacity: SharedValue<number>;
  plotHeight: number;
};

export function ChartLayer({
  paths,
  isUp,
  opacity,
  lineProgress,
  lineOpacity,
  plotHeight,
}: ChartLayerProps) {
  const priceColor = isUp ? colors.priceLineGreen : colors.priceLineRed;
  const priceFadeColor = isUp
    ? colors.priceLineGreenTransparent
    : colors.priceLineRedTransparent;

  const greenCandles = useDerivedValue(() => paths.value.greenCandles);
  const redCandles = useDerivedValue(() => paths.value.redCandles);
  const closeLine = useDerivedValue(() => paths.value.closeLine);
  const closeArea = useDerivedValue(() => paths.value.closeArea);

  const greenCandleColor = useDerivedValue(() =>
    interpolateColor(
      lineProgress.value,
      [0, 1],
      [colors.priceLineGreen, priceColor],
    ),
  );
  const redCandleColor = useDerivedValue(() =>
    interpolateColor(
      lineProgress.value,
      [0, 1],
      [colors.priceLineRed, priceColor],
    ),
  );
  const candlesOpacity = useDerivedValue(() =>
    interpolate(lineProgress.value, [0.7, 1], [1, 0], Extrapolation.CLAMP),
  );

  return (
    <Group opacity={opacity}>
      <Group opacity={candlesOpacity}>
        <Path path={greenCandles} color={greenCandleColor} />
        <Path path={redCandles} color={redCandleColor} />
      </Group>
      <Group opacity={lineOpacity}>
        <Path path={closeArea} opacity={AREA_OPACITY}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, plotHeight)}
            colors={[priceColor, priceFadeColor]}
          />
        </Path>
        <Path
          path={closeLine}
          color={priceColor}
          style="stroke"
          strokeWidth={LINE_WIDTH}
          strokeJoin="round"
          strokeCap="round"
        />
      </Group>
    </Group>
  );
}
