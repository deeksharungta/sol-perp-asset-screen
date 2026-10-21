import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../../theme/colors";
import { MaskedBlur } from "../ui/MaskedBlur";
import { TradeButton } from "./TradeButton";

const TRADE_BAR_HEIGHT = 72;
const MIN_BOTTOM_SPACE = 12;

function useTradeBarInset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, MIN_BOTTOM_SPACE);
}

export function useTradeBarHeight() {
  return useTradeBarInset() + TRADE_BAR_HEIGHT;
}

type TradeBarProps = {
  onGoLong: () => void;
  onGoShort: () => void;
};

export const TradeBar = memo(function TradeBar({
  onGoLong,
  onGoShort,
}: TradeBarProps) {
  const bottomInset = useTradeBarInset();

  return (
    <View
      className="pointer-events-box-none absolute bottom-0 left-0 right-0 flex-row gap-1 px-4 pt-6"
      style={{ paddingBottom: bottomInset }}
    >
      <MaskedBlur maskStyle={styles.blurMask} />
      <View
        className="pointer-events-none absolute inset-0"
        style={styles.fade}
      />

      <TradeButton side="long" onPress={onGoLong} />
      <TradeButton side="short" onPress={onGoShort} />
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
