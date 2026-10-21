import MaskedViewBase from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import type {
  ComponentProps,
  ComponentRef,
  ComponentType,
  ReactElement,
  RefObject,
} from "react";
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";

export const BLUR_INTENSITY = 30;

const MaskedView = MaskedViewBase as unknown as ComponentType<
  ViewProps & { maskElement: ReactElement }
>;

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

type MaskedBlurProps = {
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
  maskStyle: StyleProp<ViewStyle>;
  animatedProps?: ComponentProps<typeof AnimatedBlurView>["animatedProps"];
};

export function MaskedBlur({
  blurTarget,
  maskStyle,
  animatedProps,
}: MaskedBlurProps) {
  if (Platform.OS !== "ios") {
    return null;
  }

  return (
    <MaskedView
      style={styles.layer}
      maskElement={<View style={[styles.layer, maskStyle]} />}
    >
      <AnimatedBlurView
        blurTarget={blurTarget}
        blurMethod="dimezisBlurViewSdk31Plus"
        intensity={BLUR_INTENSITY}
        animatedProps={animatedProps}
        style={styles.layer}
      />
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "none",
  },
});
