import { memo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import {
  expandLayout,
  feedCardEntering,
  feedCardExiting,
  slideTiming,
} from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";
import type { TraderPost } from "../../types/traderPost";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { CommentIcon } from "../icons/CommentIcon";
import { LikeButton } from "../ui/LikeButton";
import { OlderPosts } from "./OlderPosts";
import { PositionStats } from "./PositionStats";
import { TraderSummary } from "./TraderSummary";

type TraderCardProps = {
  post: TraderPost;
  onLikePress: (postId: string) => void;
};

export const TraderCard = memo(function TraderCard({
  post,
  onLikePress,
}: TraderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const chevronRotation = useSharedValue(0);
  const olderPosts = post.olderPosts ?? [];

  const handleOlderPress = () => {
    chevronRotation.value = withTiming(isExpanded ? 0 : 180, slideTiming);
    setIsExpanded(!isExpanded);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  return (
    <Animated.View
      layout={expandLayout}
      entering={feedCardEntering}
      exiting={feedCardExiting}
      className="gap-3 rounded-3xl bg-surface p-4"
      style={surfaces.card}
    >
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
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1">
            <LikeButton
              likes={post.likes}
              isLiked={post.isLiked}
              accessibilityLabel={`Like post by ${post.traderName}`}
              onPress={() => onLikePress(post.id)}
            />

            <View className="h-6 flex-row items-center gap-1 rounded-full bg-pill pl-2 pr-1.5">
              <Text className="font-sans text-xs font-bold leading-4 text-text-tertiary">
                {post.commentCount}
              </Text>
              <CommentIcon />
            </View>
          </View>

          {olderPosts.length > 0 && (
            <Pressable
              onPress={handleOlderPress}
              accessibilityRole="button"
              accessibilityState={{ expanded: isExpanded }}
              hitSlop={8}
              className="h-6 flex-row items-center gap-1 active:opacity-60"
            >
              <Text className="font-sans text-xs font-semibold leading-4 text-text-tertiary">
                {olderPosts.length} older
              </Text>
              <Animated.View style={chevronStyle}>
                <ChevronDownIcon />
              </Animated.View>
            </Pressable>
          )}
        </View>

        <Text className="font-sans text-xs font-semibold leading-4 text-text-tertiary">
          {post.copyingCount} copying
        </Text>
      </View>

      {isExpanded && <OlderPosts posts={olderPosts} />}
    </Animated.View>
  );
});
