import { memo } from "react";
import { Text, View } from "react-native";

import { surfaces } from "../../theme/surfaces";
import type { TraderPost } from "../../types/traderPost";
import { CommentIcon } from "../icons/CommentIcon";
import { HeartIcon } from "../icons/HeartIcon";
import { PositionStats } from "./PositionStats";
import { TraderSummary } from "./TraderSummary";

type TraderCardProps = {
  post: TraderPost;
};

export const TraderCard = memo(function TraderCard({ post }: TraderCardProps) {
  return (
    <View className="gap-3 rounded-3xl bg-surface p-4" style={surfaces.card}>
      <TraderSummary post={post} />

      {!!post.thesis && (
        <Text
          numberOfLines={3}
          className="font-sans text-xs font-semibold leading-4 text-text-primary"
        >
          {post.thesis}
        </Text>
      )}

      <PositionStats post={post} />

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <View
            className={`h-6 flex-row items-center gap-1 rounded-full pl-2 pr-1 ${post.isLiked ? "bg-like/10" : "bg-pill"}`}
          >
            <Text
              className={`font-sans text-xs font-bold tabular-nums leading-4 ${post.isLiked ? "text-like" : "text-text-tertiary"}`}
            >
              {post.likes}
            </Text>
            <HeartIcon isFilled={post.isLiked} />
          </View>

          <View className="h-6 flex-row items-center gap-1 rounded-full bg-pill pl-2 pr-1.5">
            <Text className="font-sans text-xs font-bold leading-4 text-text-tertiary">
              {post.commentCount}
            </Text>
            <CommentIcon />
          </View>
        </View>

        <Text className="font-sans text-xs font-semibold leading-4 text-text-tertiary">
          {post.copyingCount} copying
        </Text>
      </View>
    </View>
  );
});
