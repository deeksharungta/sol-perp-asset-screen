import Svg, { Path } from "react-native-svg";

import { colors } from "../../theme/colors";

type BellIconProps = {
  size?: number;
  color?: string;
};

export function BellIcon({
  size = 20,
  color = colors.textPrimary,
}: BellIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 18C9.10908 18 8.38241 17.6169 8.01749 16.9856C7.75513 16.5317 8.2012 16.0723 8.72885 16.0723H11.2549C11.7887 16.0723 12.2362 16.5413 11.9667 16.998C11.5985 17.6219 10.8851 18 10 18ZM3 13.7532C3 12.8958 3.41106 12.1035 3.82428 11.3503C4.41822 10.2677 4.55556 8.93217 4.55556 7.39759C4.55556 4.23614 6.81111 2 10 2C13.1889 2 15.4444 4.23614 15.4444 7.39759C15.4444 8.93217 15.5818 10.2678 16.1757 11.3503C16.5889 12.1035 17 12.8958 17 13.7532C17 14.1823 16.6491 14.5301 16.2164 14.5301H3.78365C3.35085 14.5301 3 14.1823 3 13.7532Z"
        fill={color}
      />
    </Svg>
  );
}
