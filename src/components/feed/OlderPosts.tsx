import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { fadeInEntering, fadeOutExiting } from "../../theme/animations";
import type { OlderPost } from "../../types/traderPost";
import { formatShortDate, formatSignedUsd } from "../../utils/format";

type OlderPostsProps = {
  posts: OlderPost[];
};

export function OlderPosts({ posts }: OlderPostsProps) {
  return (
    <Animated.View entering={fadeInEntering} exiting={fadeOutExiting}>
      {posts.map((post, index) => (
        <Fragment key={post.id}>
          {index > 0 && (
            <View
              className="bg-black/10"
              style={{ height: StyleSheet.hairlineWidth }}
            />
          )}
          <OlderPostRow post={post} />
        </Fragment>
      ))}
    </Animated.View>
  );
}

type OlderPostRowProps = {
  post: OlderPost;
};

function OlderPostRow({ post }: OlderPostRowProps) {
  const isLong = post.side === "long";
  const isLoss = post.pnl < 0;

  return (
    <View className="flex-row items-center gap-2 py-2">
      <Text
        className={`font-sans text-xs font-bold leading-4 ${isLong ? "text-text-green" : "text-text-red"}`}
      >
        {isLong ? "Long" : "Short"} {post.leverage}x
      </Text>
      <Text
        numberOfLines={1}
        className="flex-1 font-sans text-xs font-semibold leading-4 text-text-primary"
      >
        {post.thesis}
      </Text>
      <Text className="font-sans text-xs font-semibold leading-4 text-text-tertiary">
        {formatShortDate(post.closedAt)}
      </Text>
      <Text
        className={`font-sans text-xs font-semibold tabular-nums leading-4 ${isLoss ? "text-text-red" : "text-text-green"}`}
      >
        {formatSignedUsd(post.pnl)}
      </Text>
    </View>
  );
}
