import { Text, View } from "react-native";

import { typography } from "../../theme/typography";
import type { Metric } from "../../types/market";
import { formatCompactUsd } from "../../utils/format";
import { SwitchIcon } from "../icons/SwitchIcon";

type MetricValueProps = {
  metric: Metric;
};

export function MetricValue({ metric }: MetricValueProps) {
  return (
    <>
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
    </>
  );
}
