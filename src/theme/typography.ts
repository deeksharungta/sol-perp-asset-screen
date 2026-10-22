import { StyleSheet } from "react-native";

export const typography = StyleSheet.create({
  // NativeWind ignores Tailwind's tabular-nums class.
  tabularNums: {
    fontVariant: ["tabular-nums"],
  },
  // AnimatedText is a TextInput, which sits lower than Text at the same line height.
  animatedText2xs: {
    lineHeight: 12,
  },
  animatedTextXs: {
    lineHeight: 14,
  },
});
