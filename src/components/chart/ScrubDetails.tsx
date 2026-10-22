import { memo } from "react";
import { Text, View, type StyleProp, type TextStyle } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type AnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { Candle, Timeframe } from "../../types/candle";
import { candleAt } from "../../utils/chartMath";
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

export const ScrubDetails = memo(function ScrubDetails({
  candles,
  timeframe,
  scrubIndex,
  scrubProgress,
  livePrice,
}: ScrubDetailsProps) {
  const timeframeOpen = candles[0].open;
  const timeLabels = candles.map((candle) =>
    formatCandleTime(candle.time, timeframe),
  );

  const scrubCandle = useDerivedValue(() =>
    candleAt(candles, scrubIndex.get(), livePrice.get()),
  );
  const isUp = useDerivedValue(() => scrubCandle.get().close >= timeframeOpen);

  const closeText = useDerivedValue(() => formatPrice(scrubCandle.get().close));
  const changeText = useDerivedValue(() =>
    formatPriceChange(scrubCandle.get().close, timeframeOpen),
  );
  const timeText = useDerivedValue(() => timeLabels[scrubIndex.get()]);
  const openText = useDerivedValue(() => formatPrice(scrubCandle.get().open));
  const highText = useDerivedValue(() => formatPrice(scrubCandle.get().high));
  const lowText = useDerivedValue(() => formatPrice(scrubCandle.get().low));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrubProgress.get(),
      [0.5, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const candleColorStyle = useAnimatedStyle(() => ({
    color:
      scrubCandle.get().close >= scrubCandle.get().open
        ? colors.textGreen
        : colors.textRed,
  }));

  return (
    <Animated.View
      className="pointer-events-none absolute inset-x-0 top-0 flex-row justify-between px-4"
      style={fadeStyle}
      aria-hidden
    >
      <View className="gap-1">
        <AnimatedText
          text={closeText}
          className="h-6 w-32 font-sans text-xl font-semibold text-text-primary"
        />
        <AnimatedPriceChange isUp={isUp} text={changeText} />
        <AnimatedText
          text={timeText}
          className="h-4 w-32 font-sans text-xs font-semibold text-text-tertiary"
          style={typography.animatedTextXs}
        />
      </View>

      <View className="flex-row gap-3">
        <View>
          <OhlcValue label="O" value={openText} />
          <OhlcValue
            label="C"
            value={closeText}
            colorStyle={candleColorStyle}
          />
        </View>
        <View>
          <OhlcValue label="H" value={highText} />
          <OhlcValue label="L" value={lowText} />
        </View>
      </View>
    </Animated.View>
  );
});

type OhlcValueProps = {
  label: string;
  value: SharedValue<string>;
  colorStyle?: StyleProp<AnimatedStyle<TextStyle>>;
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
