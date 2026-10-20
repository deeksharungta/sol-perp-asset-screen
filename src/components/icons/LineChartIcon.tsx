import Svg, { Polygon, Polyline } from "react-native-svg";

import { colors } from "../../theme/colors";

const LINE_POINTS = "1,11 5,6 9,9 14,2";

export function LineChartIcon() {
  return (
    <Svg width={15} height={14} viewBox="0 0 15 14" fill="none">
      <Polygon
        points={`${LINE_POINTS} 14,14 1,14`}
        fill={colors.priceLineGreen}
        opacity={0.16}
      />
      <Polyline
        points={LINE_POINTS}
        stroke={colors.priceLineGreen}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
