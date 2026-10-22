import { useRef, useState, type ComponentRef } from "react";
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
import type { Timeframe } from "../../types/candle";
import type { Metric } from "../../types/market";
import { formatPrice, formatPriceChange, formatUsd } from "../../utils/format";
import { AnimatedPriceChange } from "../ui/AnimatedPriceChange";
import { AnimatedText } from "../ui/AnimatedText";
import { MetricSheet } from "./MetricSheet";
import { MetricValue } from "./MetricValue";

type PriceBlockProps = {
  livePrice: SharedValue<number>;
  timeframeOpen: number;
  lastClose: number;
  timeframe: Timeframe;
  metrics: Metric[];
};

export function PriceBlock({
  livePrice,
  timeframeOpen,
  lastClose,
  timeframe,
  metrics,
}: PriceBlockProps) {
  const metricRef = useRef<ComponentRef<typeof View>>(null);
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [isMetricSheetOpen, setIsMetricSheetOpen] = useState(false);
  const [metricSheetAnchorY, setMetricSheetAnchorY] = useState(0);
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
    formatPriceChange(livePrice.value, timeframeOpen),
  );
  const isUp = useDerivedValue(() => livePrice.value >= timeframeOpen);

  const handleOpenMetrics = () => {
    metricRef.current?.measureInWindow((_x, y, _width, height) => {
      setMetricSheetAnchorY(y + height);
      setIsMetricSheetOpen(true);
    });
  };

  const handleSelectMetric = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsMetricSheetOpen(false);
  };

  const handleCloseMetrics = () => {
    setIsMetricSheetOpen(false);
  };

  return (
    <>
      <View className="flex-row items-end justify-between px-4">
        <View
          accessible
          accessibilityLabel={`Price ${formatUsd(lastClose)}, ${lastClose >= timeframeOpen ? "up" : "down"} ${formatPriceChange(lastClose, timeframeOpen)} over ${timeframe}`}
          className="gap-1"
        >
          <AnimatedText
            text={priceText}
            className="h-6 font-sans text-xl font-semibold"
            style={priceFlashStyle}
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
          <MetricValue metric={selectedMetric} />
        </Pressable>
      </View>
      <MetricSheet
        visible={isMetricSheetOpen}
        metrics={metrics}
        anchorY={metricSheetAnchorY}
        onSelect={handleSelectMetric}
        onClose={handleCloseMetrics}
      />
    </>
  );
}
