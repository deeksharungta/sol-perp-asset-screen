import { memo, type ComponentRef, type RefObject } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { colors } from "../../theme/colors";
import { BLUR_INTENSITY, MaskedBlur } from "../ui/MaskedBlur";

type HeaderFadeProps = {
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
  scrollY: SharedValue<number>;
};

export const HeaderFade = memo(function HeaderFade({
  blurTarget,
  scrollY,
}: HeaderFadeProps) {
  // iOS blur ignores parent opacity, so the blur strength itself is turned off at the top.
  const blurProps = useAnimatedProps(() => ({
    intensity: scrollY.value > 0 ? BLUR_INTENSITY : 0,
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: scrollY.value > 0 ? 1 : 0,
  }));

  return (
    <View className="pointer-events-none absolute left-0 right-0 top-0 h-6">
      <MaskedBlur
        blurTarget={blurTarget}
        maskStyle={styles.blurMask}
        animatedProps={blurProps}
      />
      <Animated.View
        className="absolute inset-0"
        style={[styles.fade, fadeStyle]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  blurMask: {
    backgroundImage: `linear-gradient(to top, ${colors.surfaceTransparent}, ${colors.surface} 80%)`,
  },
  fade: {
    backgroundImage: `linear-gradient(to top, ${colors.backgroundTransparent}, ${colors.background})`,
  },
});
