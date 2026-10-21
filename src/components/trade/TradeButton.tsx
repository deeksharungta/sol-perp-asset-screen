import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { pressSpring } from "../../theme/animations";
import { colors } from "../../theme/colors";
import type { TradeSide } from "../../types/traderPost";
import { TriangleIcon } from "../icons/TriangleIcon";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PRESSED_SCALE = 0.96;

type TradeButtonProps = {
  side: TradeSide;
  onPress: () => void;
};

export function TradeButton({ side, onPress }: TradeButtonProps) {
  const isLong = side === "long";
  const pressScale = useSharedValue(1);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const handlePressIn = () => {
    pressScale.value = withSpring(PRESSED_SCALE, pressSpring);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, pressSpring);
  };

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={isLong ? "Go long" : "Go short"}
      className={`h-12 flex-1 flex-row items-center justify-center gap-1 rounded-full ${isLong ? "px-3" : "px-2"}`}
      style={[isLong ? styles.long : styles.short, pressStyle]}
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
    </AnimatedPressable>
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
