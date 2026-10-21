import { Fragment } from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { fadeInEntering, fadeOutExiting } from "../../theme/animations";
import type { OlderPost } from "../../types/traderPost";
import { formatShortDate } from "../../utils/format";
import { Divider } from "../ui/Divider";
import { PnlText } from "../ui/PnlText";
import { SideLabel } from "../ui/SideLabel";

type OlderPostsProps = {
  posts: OlderPost[];
};

export function OlderPosts({ posts }: OlderPostsProps) {
  return (
    <Animated.View entering={fadeInEntering} exiting={fadeOutExiting}>
      {posts.map((post, index) => (
        <Fragment key={post.id}>
          {index > 0 && <Divider />}
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
  return (
    <View className="gap-1 py-2">
      <View className="flex-row items-center gap-2">
        <SideLabel side={post.side} leverage={post.leverage} />
        <Text className="flex-1 font-sans text-xs font-semibold leading-4 text-text-tertiary">
          {formatShortDate(post.closedAt)}
        </Text>
        <PnlText value={post.pnl} />
      </View>
      <Text
        numberOfLines={1}
        className="font-sans text-xs font-semibold leading-4 text-text-primary"
      >
        {post.thesis}
      </Text>
    </View>
  );
}
