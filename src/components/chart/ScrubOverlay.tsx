import { Group, Path, Skia } from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

import { colors } from "../../theme/colors";
import { indexToX } from "../../utils/chartMath";

const DIM_OPACITY = 0.5;

type ScrubOverlayProps = {
  scrubIndex: SharedValue<number>;
  scrubX: SharedValue<number>;
  scrubProgress: SharedValue<number>;
  candleStep: SharedValue<number>;
  plotWidth: SharedValue<number>;
  height: number;
};

export function ScrubOverlay({
  scrubIndex,
  scrubX,
  scrubProgress,
  candleStep,
  plotWidth,
  height,
}: ScrubOverlayProps) {
  const selectedX = useDerivedValue(() =>
    indexToX(scrubIndex.value, candleStep.value),
  );
  const crosshair = useDerivedValue(() =>
    Skia.PathBuilder.Make()
      .moveTo(scrubX.value, 0)
      .lineTo(scrubX.value, height)
      .detach(),
  );
  // Covers everything except the selected candle's slot.
  const dimmedArea = useDerivedValue(() => {
    const slotLeft = selectedX.value - candleStep.value / 2;
    const slotRight = selectedX.value + candleStep.value / 2;
    return Skia.PathBuilder.Make()
      .addRect(Skia.XYWHRect(0, 0, slotLeft, height))
      .addRect(Skia.XYWHRect(slotRight, 0, plotWidth.value - slotRight, height))
      .detach();
  });

  return (
    <Group opacity={scrubProgress}>
      <Path path={dimmedArea} color={colors.background} opacity={DIM_OPACITY} />
      <Path
        path={crosshair}
        color={colors.textTertiary}
        style="stroke"
        strokeWidth={StyleSheet.hairlineWidth}
      />
    </Group>
  );
}
