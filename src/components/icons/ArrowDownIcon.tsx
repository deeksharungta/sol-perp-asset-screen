import Svg, { Path } from "react-native-svg";

import { colors } from "../../theme/colors";

type ArrowDownIconProps = {
  color?: string;
};

export function ArrowDownIcon({
  color = colors.textSecondary,
}: ArrowDownIconProps) {
  return (
    <Svg width={8} height={10} viewBox="0 0 8 10" fill="none">
      <Path
        d="M3.1998 0.768953V7.37402L1.36501 5.60984C1.05266 5.30983 0.546685 5.30983 0.234327 5.60984C-0.0781091 5.91026 -0.0781091 6.39751 0.234327 6.69792L3.43419 9.77463L3.49325 9.82602C3.6355 9.938 3.81408 9.99993 3.99953 10C4.21172 10 4.41577 9.9189 4.56581 9.77463L7.76567 6.69792C8.07811 6.39751 8.07811 5.91026 7.76567 5.60984C7.45322 5.30958 6.94643 5.30948 6.63405 5.60984L4.8002 7.37402V0.768953C4.80003 0.344245 4.44128 0 3.99953 0C3.55793 0.000162125 3.19997 0.344345 3.1998 0.768953Z"
        fill={color}
      />
    </Svg>
  );
}
