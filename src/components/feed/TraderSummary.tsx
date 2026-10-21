import { Fragment } from "react";
import { Text, View } from "react-native";

import type { TraderPost } from "../../types/traderPost";
import { formatCompactUsd, formatUsd } from "../../utils/format";
import { AmountWithPnl } from "../ui/AmountWithPnl";
import { Avatar } from "../ui/Avatar";

type TraderSummaryProps = {
  post: TraderPost;
};

export function TraderSummary({ post }: TraderSummaryProps) {
  const stats = [
    `Top ${post.rank}`,
    `${post.winRate}% WR`,
    formatCompactUsd(post.accountValue),
  ];

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Avatar source={post.avatar} isVerified={post.isVerified} />

        <View className="gap-0.5">
          <Text className="font-sans text-base font-semibold leading-5 text-text-primary">
            {post.traderName}
          </Text>
          <View className="flex-row items-center gap-1">
            {stats.map((stat, index) => (
              <Fragment key={stat}>
                {index > 0 && (
                  <View className="h-0.5 w-0.5 rounded-full bg-black/25" />
                )}
                <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
                  {stat}
                </Text>
              </Fragment>
            ))}
          </View>
        </View>
      </View>

      <AmountWithPnl amount={formatUsd(post.positionValue)} pnl={post.pnl} />
    </View>
  );
}
