import type { ComponentProps } from "react";
import { TextInput, type TextInputProps } from "react-native";
import Animated, {
  useAnimatedProps,
  type SharedValue,
} from "react-native-reanimated";

import { typography } from "../../theme/typography";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type AnimatedTextProps = {
  text: SharedValue<string>;
  className?: string;
  style?: ComponentProps<typeof AnimatedTextInput>["style"];
};

export function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const animatedProps = useAnimatedProps(
    () => ({ text: text.value, defaultValue: text.value }) as TextInputProps,
  );

  return (
    <AnimatedTextInput
      editable={false}
      maxFontSizeMultiplier={1.2}
      importantForAccessibility="no"
      animatedProps={animatedProps}
      className={`pointer-events-none p-0 ${className ?? ""}`}
      style={[typography.tabularNums, style]}
    />
  );
}
