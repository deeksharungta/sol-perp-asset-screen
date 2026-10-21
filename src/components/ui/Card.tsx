import type { ComponentProps } from "react";
import Animated from "react-native-reanimated";

import { surfaces } from "../../theme/surfaces";

type CardProps = ComponentProps<typeof Animated.View>;

export function Card({ className, style, ...props }: CardProps) {
  return (
    <Animated.View
      className={`rounded-3xl bg-surface ${className ?? ""}`}
      style={[surfaces.card, style]}
      {...props}
    />
  );
}
