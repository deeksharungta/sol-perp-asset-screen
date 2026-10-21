import type { ComponentRef, RefObject } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";
import { MaskedBlur } from "../ui/MaskedBlur";
import { TradeButton } from "./TradeButton";

export const TRADE_BAR_HEIGHT = 72;

const MIN_BOTTOM_SPACE = 12;

export function useTradeBarInset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, MIN_BOTTOM_SPACE);
}

type TradeBarProps = {
  blurTarget: RefObject<ComponentRef<typeof View> | null>;
  onGoLong: () => void;
  onGoShort: () => void;
};

export function TradeBar({ blurTarget, onGoLong, onGoShort }: TradeBarProps) {
  const bottomInset = useTradeBarInset();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-row gap-1 px-4 pt-6"
      style={[styles.passThrough, { paddingBottom: bottomInset }]}
    >
      <MaskedBlur blurTarget={blurTarget} maskStyle={styles.blurMask} />
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
  // A mask only reads alpha, so the white tokens work here.
  blurMask: {
    backgroundImage: `linear-gradient(to bottom, ${colors.surfaceTransparent}, ${colors.surface} 20%)`,
  },
  fade: {
    backgroundImage: `linear-gradient(to bottom, ${colors.surfaceTransparent} 40%, ${colors.surface})`,
  },
});
