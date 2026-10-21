import { Text, View } from "react-native";

import { typography } from "../../theme/typography";
import type { TraderPost } from "../../types/traderPost";
import {
  formatCompactUsd,
  formatSignedUsd,
  formatUsd,
} from "../../utils/format";
import { Avatar } from "../ui/Avatar";

type TraderSummaryProps = {
  post: TraderPost;
};

export function TraderSummary({ post }: TraderSummaryProps) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Avatar source={post.avatar} isVerified={post.isVerified} />

        <View className="gap-0.5">
          <Text className="font-sans text-base font-semibold leading-5 text-text-primary">
            {post.traderName}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
              Top {post.rank}
            </Text>
            <View className="h-0.5 w-0.5 rounded-full bg-black/25" />
            <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
              {post.winRate}% WR
            </Text>
            <View className="h-0.5 w-0.5 rounded-full bg-black/25" />
            <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
              {formatCompactUsd(post.accountValue)}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-end gap-0.5">
        <Text
          style={typography.tabularNums}
          className="font-sans text-base font-semibold leading-5 text-text-primary"
        >
          {formatUsd(post.positionValue)}
        </Text>
        <Text
          style={typography.tabularNums}
          className={`font-sans text-xs font-semibold leading-4 ${post.pnl < 0 ? "text-text-red" : "text-text-green"}`}
        >
          {formatSignedUsd(post.pnl)}
        </Text>
      </View>
    </View>
  );
}
