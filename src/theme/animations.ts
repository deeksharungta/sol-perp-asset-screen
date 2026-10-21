import { Easing, type WithTimingConfig } from "react-native-reanimated";

export const slideTiming: WithTimingConfig = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
};

export const drawInTiming: WithTimingConfig = {
  duration: 700,
  easing: Easing.out(Easing.cubic),
};

export const scrubFadeTiming: WithTimingConfig = {
  duration: 150,
  easing: Easing.out(Easing.quad),
};
