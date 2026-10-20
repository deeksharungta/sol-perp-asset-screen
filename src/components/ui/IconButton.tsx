import type { ReactNode } from "react";
import { Pressable, StyleSheet } from "react-native";

import { colors } from "../../theme/colors";

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
      style={styles.glass}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundImage: `linear-gradient(to bottom, ${colors.glassFillStart}, ${colors.glassFillEnd})`,
    boxShadow: `inset 0 -6px 12px 0 ${colors.glassInnerHighlight}, 0 2px 12px 0 ${colors.glassDropShadow}`,
  },
});
