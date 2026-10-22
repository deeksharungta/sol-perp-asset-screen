import { Group, Path, Skia } from "@shopify/react-native-skia";
import { StyleSheet } from "react-native";
import { useDerivedValue, type SharedValue } from "react-native-reanimated";

import { colors } from "../../theme/colors";
import { indexToX, PLOT_HEIGHT } from "../../utils/chartMath";

const DIM_OPACITY = 0.5;

type ScrubOverlayProps = {
  scrubIndex: SharedValue<number>;
  scrubX: SharedValue<number>;
  scrubProgress: SharedValue<number>;
  candleStep: SharedValue<number>;
  plotWidth: SharedValue<number>;
};

export function ScrubOverlay({
  scrubIndex,
  scrubX,
  scrubProgress,
  candleStep,
  plotWidth,
}: ScrubOverlayProps) {
  const crosshair = useDerivedValue(() =>
    Skia.PathBuilder.Make()
      .moveTo(scrubX.get(), 0)
      .lineTo(scrubX.get(), PLOT_HEIGHT)
      .detach(),
  );
  // Covers everything except the selected candle's slot.
  const dimmedArea = useDerivedValue(() => {
    const selectedX = indexToX(scrubIndex.get(), candleStep.get());
    const slotLeft = selectedX - candleStep.get() / 2;
    const slotRight = selectedX + candleStep.get() / 2;
    return Skia.PathBuilder.Make()
      .addRect(Skia.XYWHRect(0, 0, slotLeft, PLOT_HEIGHT))
      .addRect(
        Skia.XYWHRect(slotRight, 0, plotWidth.get() - slotRight, PLOT_HEIGHT),
      )
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
