import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../../theme/colors";
import { TriangleIcon } from "../icons/TriangleIcon";

type TradeButtonProps = {
  side: "long" | "short";
  onPress: () => void;
};

export function TradeButton({ side, onPress }: TradeButtonProps) {
  const isLong = side === "long";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isLong ? "Go long" : "Go short"}
      className={`h-12 flex-1 flex-row items-center justify-center gap-1 rounded-full ${isLong ? "px-3" : "px-2"}`}
      style={isLong ? styles.long : styles.short}
    >
      <Text className="font-sans text-base font-semibold leading-5 text-text-on-color">
        {isLong ? "Long" : "Short"}
      </Text>
      <View className="h-4 w-4 items-center justify-center rounded-full bg-surface">
        <TriangleIcon
          direction={isLong ? "up" : "down"}
          color={isLong ? colors.longFillEnd : colors.shortFillEnd}
          width={8}
          height={6}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  long: {
    backgroundImage: `radial-gradient(ellipse at top, ${colors.longFillStart}, ${colors.longFillEnd})`,
  },
  short: {
    backgroundImage: `radial-gradient(ellipse at top, ${colors.shortFillStart}, ${colors.shortFillEnd})`,
  },
});
