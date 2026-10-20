import Svg, { Rect } from "react-native-svg";

import { colors } from "../../theme/colors";

export function CandlesIcon() {
  return (
    <Svg width={15} height={14} viewBox="0 0 15 14" fill="none">
      <Rect
        x={0}
        y={3}
        width={3}
        height={8}
        rx={1}
        fill={colors.priceLineGreen}
      />
      <Rect
        x={4}
        y={6}
        width={3}
        height={8}
        rx={1}
        fill={colors.priceLineRed}
      />
      <Rect
        x={8}
        y={0}
        width={3}
        height={11}
        rx={1}
        fill={colors.priceLineGreen}
      />
      <Rect
        x={12}
        y={5}
        width={3}
        height={6}
        rx={1}
        fill={colors.priceLineRed}
      />
    </Svg>
  );
}
