import Svg, { Path } from "react-native-svg";

import { colors } from "../../theme/colors";

export function BackIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M11.2942 3.29996C11.6844 2.89996 12.317 2.90007 12.7073 3.29996C13.0976 3.70001 13.0976 4.34846 12.7073 4.74851L8.29124 9.27526C7.90108 9.67521 7.90129 10.3237 8.29124 10.7238L12.7073 15.2516C13.0976 15.6516 13.0976 16.3001 12.7073 16.7001C12.317 17.0998 11.6843 17.1001 11.2942 16.7001L6.8781 12.1734C5.7073 10.9732 5.7073 9.02686 6.8781 7.8267L11.2942 3.29996Z"
        fill={colors.textPrimary}
        fillOpacity={0.8}
      />
    </Svg>
  );
}
