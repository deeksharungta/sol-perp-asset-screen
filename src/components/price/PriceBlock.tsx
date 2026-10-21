import { useRef, type ComponentRef } from "react";
import { Pressable, Text, View } from "react-native";

import type { Metric } from "../../types/metric";
import { formatCompactUsd, formatPercent, formatUsd } from "../../utils/format";
import { SwitchIcon } from "../icons/SwitchIcon";
import { PriceChange } from "./PriceChange";

type PriceBlockProps = {
  price: number;
  change: number;
  changePercent: number;
  timeframe: string;
  metric: Metric;
  onOpenMetrics: (anchorY: number) => void;
};

export function PriceBlock({
  price,
  change,
  changePercent,
  timeframe,
  metric,
  onOpenMetrics,
}: PriceBlockProps) {
  const metricRef = useRef<ComponentRef<typeof View>>(null);
  const isPositive = change >= 0;
  const changeText = `${formatUsd(Math.abs(change))} (${formatPercent(Math.abs(changePercent))})`;

  const handleOpenMetrics = () => {
    metricRef.current?.measureInWindow((_x, y, _width, height) => {
      onOpenMetrics(y + height);
    });
  };

  return (
    <View className="flex-row items-end justify-between px-4">
      <View>
        <Text className="font-sans text-xl font-semibold tabular-nums leading-6 text-text-primary">
          {formatUsd(price)}
        </Text>
        <PriceChange isPositive={isPositive}>
          {changeText} <Text className="text-text-secondary">{timeframe}</Text>
        </PriceChange>
      </View>

      <Pressable
        ref={metricRef}
        onPress={handleOpenMetrics}
        accessibilityRole="button"
        hitSlop={8}
        className="items-end"
      >
        <Text className="font-sans text-base font-semibold tabular-nums leading-5 text-text-primary">
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
