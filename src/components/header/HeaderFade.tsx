import MaskedViewBase from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import type {
  ComponentRef,
  ComponentType,
  ReactElement,
  RefObject,
} from "react";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { colors } from "../../theme/colors";

const BLUR_INTENSITY = 30;

const MaskedView = MaskedViewBase as unknown as ComponentType<
  ViewProps & { maskElement: ReactElement }
>;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type HeaderFadeProps = {
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
  scrollY: SharedValue<number>;
};

export function HeaderFade({ blurTarget, scrollY }: HeaderFadeProps) {
  // iOS blur ignores parent opacity, so the blur strength itself is turned off at the top.
  const blurProps = useAnimatedProps(() => ({
    intensity: scrollY.value > 0 ? BLUR_INTENSITY : 0,
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: scrollY.value > 0 ? 1 : 0,
  }));

  return (
    <View
      className="absolute left-0 right-0 top-0 h-6"
      style={styles.passThrough}
    >
      {Platform.OS === "ios" && (
        <MaskedView
          style={styles.layer}
          maskElement={<View style={[styles.layer, styles.blurMask]} />}
        >
          <AnimatedBlurView
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            animatedProps={blurProps}
            style={styles.layer}
          />
        </MaskedView>
      )}
      <Animated.View style={[styles.layer, styles.fade, fadeStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  passThrough: {
    pointerEvents: "none",
  },
  layer: {
    ...StyleSheet.absoluteFill,
  },
  blurMask: {
    backgroundImage: `linear-gradient(to top, ${colors.surfaceTransparent}, ${colors.surface} 80%)`,
  },
  fade: {
    backgroundImage: `linear-gradient(to top, ${colors.backgroundTransparent}, ${colors.background})`,
  },
});
