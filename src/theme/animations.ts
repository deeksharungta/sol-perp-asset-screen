import {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

export const slideTiming: WithTimingConfig = {
  duration: 250,
  easing: Easing.out(Easing.cubic),
};

export const priceTickTiming: WithTimingConfig = {
  duration: 300,
};

export const likePopTiming: WithTimingConfig = {
  duration: 120,
  easing: Easing.out(Easing.quad),
};

export const pressSpring: WithSpringConfig = {
  damping: 20,
  stiffness: 400,
};

export const expandLayout = LinearTransition.duration(250).easing(
  Easing.out(Easing.cubic),
);

export const fadeInEntering = FadeIn.duration(250);

export const fadeOutExiting = FadeOut.duration(150);

export const drawInTiming: WithTimingConfig = {
  duration: 700,
  easing: Easing.out(Easing.cubic),
};

export const scrubFadeTiming: WithTimingConfig = {
  duration: 150,
  easing: Easing.out(Easing.quad),
};
