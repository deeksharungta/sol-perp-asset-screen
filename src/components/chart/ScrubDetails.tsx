import { memo, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { Candle, Timeframe } from "../../types/candle";
import {
  formatCandleTime,
  formatPrice,
  formatPriceChange,
} from "../../utils/format";
import { AnimatedPriceChange } from "../ui/AnimatedPriceChange";
import { AnimatedText } from "../ui/AnimatedText";

type ScrubDetailsProps = {
  candles: Candle[];
  timeframe: Timeframe;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
  livePrice: SharedValue<number>;
};

// Takes the price block's place while scrubbing, in the same layout.
export const ScrubDetails = memo(function ScrubDetails({
  candles,
  timeframe,
  scrubIndex,
  scrubProgress,
  livePrice,
}: ScrubDetailsProps) {
  const openPrice = candles[0].open;
  const timeLabels = useMemo(
    () => candles.map((item) => formatCandleTime(item.time, timeframe)),
    [candles, timeframe],
  );

  const candle = useDerivedValue(() => {
    const item = candles[scrubIndex.value];
    if (scrubIndex.value < candles.length - 1) {
      return item;
    }
    const price = livePrice.value;
    return {
      ...item,
      close: price,
      high: Math.max(item.high, price),
      low: Math.min(item.low, price),
    };
  });
  const isUp = useDerivedValue(() => candle.value.close >= openPrice);

  const close = useDerivedValue(() => formatPrice(candle.value.close));
  const change = useDerivedValue(() =>
    formatPriceChange(candle.value.close, openPrice),
  );
  const time = useDerivedValue(() => timeLabels[scrubIndex.value]);
  const open = useDerivedValue(() => formatPrice(candle.value.open));
  const high = useDerivedValue(() => formatPrice(candle.value.high));
  const low = useDerivedValue(() => formatPrice(candle.value.low));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrubProgress.value,
      [0.5, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const candleColorStyle = useAnimatedStyle(() => ({
    color:
      candle.value.close >= candle.value.open
        ? colors.textGreen
        : colors.textRed,
  }));

  return (
    <Animated.View
      className="pointer-events-none absolute inset-x-0 top-0 flex-row justify-between px-4"
      style={fadeStyle}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className="gap-1">
        <AnimatedText
          text={close}
          className="h-6 w-32 font-sans text-xl font-semibold text-text-primary"
        />
        <AnimatedPriceChange isUp={isUp} text={change} />
        <AnimatedText
          text={time}
          className="h-4 w-32 font-sans text-xs font-semibold text-text-tertiary"
          style={typography.animatedTextXs}
        />
      </View>

      <View className="flex-row gap-3">
        <View>
          <OhlcValue label="O" value={open} />
          <OhlcValue label="C" value={close} colorStyle={candleColorStyle} />
        </View>
        <View>
          <OhlcValue label="H" value={high} />
          <OhlcValue label="L" value={low} />
        </View>
      </View>
    </Animated.View>
  );
});

type OhlcValueProps = {
  label: string;
  value: SharedValue<string>;
  colorStyle?: ReturnType<typeof useAnimatedStyle>;
};

function OhlcValue({ label, value, colorStyle }: OhlcValueProps) {
  return (
    <View className="h-5 flex-row items-center gap-1">
      <Text className="font-sans text-xs font-semibold text-text-tertiary">
        {label}:
      </Text>
      <AnimatedText
        text={value}
        className="w-14 font-sans text-xs font-semibold text-text-primary"
        style={[typography.animatedTextXs, colorStyle]}
      />
    </View>
  );
}
