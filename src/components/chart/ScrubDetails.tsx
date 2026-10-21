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
import type { Candle, Timeframe } from "../../types/candle";
import { formatCandleTime, formatPrice } from "../../utils/format";
import { TriangleIcon } from "../icons/TriangleIcon";
import { AnimatedText } from "../ui/AnimatedText";

type ScrubDetailsProps = {
  candles: Candle[];
  timeframe: Timeframe;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
};

// Takes the price block's place while scrubbing, in the same layout.
export const ScrubDetails = memo(function ScrubDetails({
  candles,
  timeframe,
  scrubIndex,
  scrubProgress,
}: ScrubDetailsProps) {
  const openPrice = candles[0].open;
  const timeLabels = useMemo(
    () => candles.map((item) => formatCandleTime(item.time, timeframe)),
    [candles, timeframe],
  );

  const candle = useDerivedValue(() => candles[scrubIndex.value]);
  const isUp = useDerivedValue(() => candle.value.close >= openPrice);

  const close = useDerivedValue(() => formatPrice(candle.value.close));
  const change = useDerivedValue(() => {
    const difference = candle.value.close - openPrice;
    const percent = (difference / openPrice) * 100;
    return `${formatPrice(Math.abs(difference))} (${Math.abs(percent).toFixed(2)}%)`;
  });
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
  const changeColorStyle = useAnimatedStyle(() => ({
    color: isUp.value ? colors.textGreen : colors.textRed,
  }));
  const upTriangleStyle = useAnimatedStyle(() => ({
    opacity: isUp.value ? 1 : 0,
  }));
  const downTriangleStyle = useAnimatedStyle(() => ({
    opacity: isUp.value ? 0 : 1,
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
    >
      <View>
        <AnimatedText
          text={close}
          className="h-6 w-32 font-sans text-xl font-semibold tabular-nums text-text-primary"
        />
        <View className="h-4 flex-row items-center gap-0.5">
          <View className="h-1.5 w-1.5">
            <Animated.View className="absolute" style={upTriangleStyle}>
              <TriangleIcon direction="up" color={colors.textGreen} />
            </Animated.View>
            <Animated.View className="absolute" style={downTriangleStyle}>
              <TriangleIcon direction="down" color={colors.textRed} />
            </Animated.View>
          </View>
          <AnimatedText
            text={change}
            className="w-32 font-sans text-xs font-semibold tabular-nums"
            style={changeColorStyle}
          />
        </View>
        <AnimatedText
          text={time}
          className="h-4 w-32 font-sans text-xs font-semibold tabular-nums text-text-tertiary"
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
        className="w-14 font-sans text-xs font-semibold tabular-nums text-text-primary"
        style={colorStyle}
      />
    </View>
  );
}
