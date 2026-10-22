import { Fragment } from "react";
import { Text, View } from "react-native";

import type { TraderPost } from "../../types/traderPost";
import { formatCompactUsd } from "../../utils/format";
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
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1 flex-row items-center gap-3">
        <Avatar source={post.avatar} isVerified={post.isVerified} />

        <View className="flex-1 gap-0.5">
          <Text
            numberOfLines={1}
            className="font-sans text-base font-semibold leading-5 text-text-primary"
          >
            {post.traderName}
          </Text>
          <View className="flex-row items-center gap-1">
            {stats.map((stat, index) => (
              <Fragment key={stat}>
                {index > 0 && (
                  <View className="h-0.5 w-0.5 rounded-full bg-separator" />
                )}
                <Text
                  numberOfLines={1}
                  className="shrink font-sans text-xs font-semibold leading-4 text-text-secondary"
                >
                  {stat}
                </Text>
              </Fragment>
            ))}
          </View>
        </View>
      </View>

      <AmountWithPnl amount={post.positionValue} pnl={post.pnl} />
    </View>
  );
}
