import type { ReactNode } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { TriangleIcon } from "../icons/TriangleIcon";
import { AnimatedText } from "../ui/AnimatedText";

type AnimatedPriceChangeProps = {
  isUp: SharedValue<boolean>;
  text: SharedValue<string>;
  children?: ReactNode;
};

export function AnimatedPriceChange({
  isUp,
  text,
  children,
}: AnimatedPriceChangeProps) {
  const colorStyle = useAnimatedStyle(() => ({
    color: isUp.value ? colors.textGreen : colors.textRed,
  }));
  const upTriangleStyle = useAnimatedStyle(() => ({
    opacity: isUp.value ? 1 : 0,
  }));
  const downTriangleStyle = useAnimatedStyle(() => ({
    opacity: isUp.value ? 0 : 1,
  }));

  return (
    <View className="h-4 flex-row items-center gap-0.5">
      <View className="h-1.5 w-1.5">
        <Animated.View className="absolute" style={upTriangleStyle}>
          <TriangleIcon direction="up" color={colors.textGreen} />
        </Animated.View>
        <Animated.View className="absolute" style={downTriangleStyle}>
          <TriangleIcon direction="down" color={colors.textRed} />
        </Animated.View>
      </View>
      <AnimatedText
        text={text}
        className="font-sans text-xs font-semibold"
        style={[typography.animatedTextXs, colorStyle]}
      />
      {children}
    </View>
  );
}
