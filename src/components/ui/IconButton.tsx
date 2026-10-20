import type { ReactNode } from "react";
import { Pressable } from "react-native";

import { surfaces } from "../../theme/surfaces";

type IconButtonProps = {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
};

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      className="h-9 w-9 items-center justify-center rounded-full"
      style={surfaces.glass}
    >
      {icon}
    </Pressable>
  );
}
