import { Text, View } from "react-native";

import { typography } from "../../theme/typography";
import type { TraderPost } from "../../types/traderPost";
import { formatUsd } from "../../utils/format";

type PositionStatsProps = {
  post: TraderPost;
};

export function PositionStats({ post }: PositionStatsProps) {
  const stats = [
    { label: "Avg entry", value: post.avgEntry },
    { label: "Take profit", value: post.takeProfit },
    { label: "Stop loss", value: post.stopLoss },
    { label: "Liq price", value: post.liqPrice },
  ];

  return (
    <View className="flex-row justify-between">
      {stats.map((stat) => (
        <View key={stat.label}>
          <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
            {stat.label}
          </Text>
          <Text
            style={typography.tabularNums}
            className="font-sans text-xs font-semibold leading-4 text-text-primary"
          >
            {formatUsd(stat.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}
