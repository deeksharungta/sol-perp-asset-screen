import { useRef, type ComponentRef } from "react";
import { Pressable, Text, View } from "react-native";
import {
  interpolateColor,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { priceFlashTiming } from "../../theme/animations";
import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import type { Metric } from "../../types/metric";
import {
  formatCompactUsd,
  formatPrice,
  formatPriceChange,
} from "../../utils/format";
import { SwitchIcon } from "../icons/SwitchIcon";
import { AnimatedText } from "../ui/AnimatedText";
import { AnimatedPriceChange } from "./AnimatedPriceChange";

type PriceBlockProps = {
  livePrice: SharedValue<number>;
  openPrice: number;
  timeframe: string;
  metric: Metric;
  onOpenMetrics: (anchorY: number) => void;
};

export function PriceBlock({
  livePrice,
  openPrice,
  timeframe,
  metric,
  onOpenMetrics,
}: PriceBlockProps) {
  const metricRef = useRef<ComponentRef<typeof View>>(null);
  const priceText = useDerivedValue(() => formatPrice(livePrice.value));
  const priceFlash = useSharedValue(0);
  const priceDirection = useSharedValue(0);

  // The live price glides every frame, so flash only when it turns, not on every frame it moves.
  useAnimatedReaction(
    () => livePrice.value,
    (current, previous) => {
      if (previous === null || current === previous) {
        return;
      }
      const direction = current > previous ? 1 : -1;
      if (direction === priceDirection.value) {
        return;
      }
      priceDirection.value = direction;
      priceFlash.value = direction;
      priceFlash.value = withTiming(0, priceFlashTiming);
    },
  );

  const priceFlashStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      priceFlash.value,
      [-1, 0, 1],
      [colors.textRed, colors.textPrimary, colors.textGreen],
    ),
  }));
  const changeText = useDerivedValue(() =>
    formatPriceChange(livePrice.value, openPrice),
  );
  const isUp = useDerivedValue(() => livePrice.value >= openPrice);

  const handleOpenMetrics = () => {
    metricRef.current?.measureInWindow((_x, y, _width, height) => {
      onOpenMetrics(y + height);
    });
  };

  return (
    <View className="flex-row items-end justify-between px-4">
      <View className="gap-1">
        <AnimatedText
          text={priceText}
          className="h-6 font-sans text-xl font-semibold"
          style={[typography.tabularNums, priceFlashStyle]}
        />
        <AnimatedPriceChange isUp={isUp} text={changeText}>
          <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
            {timeframe}
          </Text>
        </AnimatedPriceChange>
      </View>

      <Pressable
        ref={metricRef}
        onPress={handleOpenMetrics}
        accessibilityRole="button"
        hitSlop={8}
        className="items-end"
      >
        <Text
          style={typography.tabularNums}
          className="font-sans text-base font-semibold leading-5 text-text-primary"
        >
          {formatCompactUsd(metric.value)}
        </Text>
        <View className="flex-row items-center gap-1">
          <SwitchIcon />
          <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
            {metric.label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
