import { Easing, type WithTimingConfig } from "react-native-reanimated";

export const slideTiming: WithTimingConfig = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
};
