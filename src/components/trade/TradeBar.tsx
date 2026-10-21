import { memo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { slideTiming } from "../../theme/animations";
import { colors } from "../../theme/colors";
import { PRICE_PEEK_START } from "../header/AssetHeader";
import { MaskedBlur } from "../ui/MaskedBlur";
import { TradeButton } from "./TradeButton";

const TRADE_BAR_HEIGHT = 72;
const MIN_BOTTOM_SPACE = 12;
const COMPACT_SHRINK = 0.06;

function useTradeBarInset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, MIN_BOTTOM_SPACE);
}

export function useTradeBarHeight() {
  return useTradeBarInset() + TRADE_BAR_HEIGHT;
}

type TradeBarProps = {
  scrollY: SharedValue<number>;
  onGoLong: () => void;
  onGoShort: () => void;
};

export const TradeBar = memo(function TradeBar({
  scrollY,
  onGoLong,
  onGoShort,
}: TradeBarProps) {
  const bottomInset = useTradeBarInset();
  const compactProgress = useSharedValue(0);
  const isReducedMotion = useReducedMotion();
  useAnimatedReaction(
    () => !isReducedMotion && scrollY.value > PRICE_PEEK_START,
    (isCompact, wasCompact) => {
      if (isCompact !== wasCompact) {
        compactProgress.value = withTiming(isCompact ? 1 : 0, slideTiming);
      }
    },
  );
  const compactStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - compactProgress.value * COMPACT_SHRINK }],
    transformOrigin: "bottom",
  }));

  return (
    <View
      className="pointer-events-box-none absolute bottom-0 left-0 right-0 px-4 pt-6"
      style={{ paddingBottom: bottomInset }}
    >
      <MaskedBlur maskStyle={styles.blurMask} />
      <View
        className="pointer-events-none absolute inset-0"
        style={styles.fade}
      />

      <Animated.View
        className="pointer-events-box-none flex-row gap-1"
        style={compactStyle}
      >
        <TradeButton side="long" onPress={onGoLong} />
        <TradeButton side="short" onPress={onGoShort} />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  // A mask only reads alpha, so the white tokens work here.
  blurMask: {
    backgroundImage: `linear-gradient(to bottom, ${colors.surfaceTransparent}, ${colors.surface} 20%)`,
  },
  fade: {
    backgroundImage: `linear-gradient(to bottom, ${colors.surfaceTransparent} 40%, ${colors.surface})`,
  },
});
