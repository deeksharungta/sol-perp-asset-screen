import Svg, { Path } from "react-native-svg";

import { colors } from "../../theme/colors";

export function SwitchIcon() {
  return (
    <Svg width={10} height={14} viewBox="0 0 10 14" fill="none">
      <Path
        d="M1.5 5L5 1.5L8.5 5M1.5 9L5 12.5L8.5 9"
        stroke={colors.textSecondary}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
