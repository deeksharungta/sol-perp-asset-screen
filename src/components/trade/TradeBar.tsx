import MaskedViewBase from "@react-native-masked-view/masked-view";
import { BlurView } from "expo-blur";
import type {
  ComponentRef,
  ComponentType,
  ReactElement,
  RefObject,
} from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";
import { TradeButton } from "./TradeButton";

export const TRADE_BAR_HEIGHT = 72;

const BLUR_INTENSITY = 30;

const MaskedView = MaskedViewBase as unknown as ComponentType<
  ViewProps & { maskElement: ReactElement }
>;

type TradeBarProps = {
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
  onGoLong: () => void;
  onGoShort: () => void;
};

export function TradeBar({ blurTarget, onGoLong, onGoShort }: TradeBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row gap-1 px-4 pt-6"
      style={[styles.passThrough, { paddingBottom: insets.bottom }]}
    >
      <MaskedView
        style={styles.layer}
        maskElement={<View style={[styles.fill, styles.blurMask]} />}
      >
        <BlurView
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={BLUR_INTENSITY}
          style={styles.fill}
        />
      </MaskedView>
      <View style={[styles.layer, styles.fade]} />

      <TradeButton side="long" onPress={onGoLong} />
      <TradeButton side="short" onPress={onGoShort} />
    </View>
  );
}

const styles = StyleSheet.create({
  passThrough: {
    pointerEvents: "box-none",
  },
  layer: {
    ...StyleSheet.absoluteFill,
    pointerEvents: "none",
  },
  fill: {
    flex: 1,
  },
  // A mask only reads alpha, so the white tokens work here.
  blurMask: {
    backgroundImage: `linear-gradient(to bottom, ${colors.surfaceTransparent}, ${colors.surface} 20%)`,
  },
  fade: {
    backgroundImage: `linear-gradient(to bottom, ${colors.surfaceTransparent} 40%, ${colors.surface})`,
  },
});
