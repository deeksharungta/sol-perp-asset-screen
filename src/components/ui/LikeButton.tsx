import { Pressable, Text } from "react-native";

import { HeartIcon } from "../icons/HeartIcon";

type LikeButtonProps = {
  likes: number;
  isLiked: boolean;
  accessibilityLabel: string;
  onPress: () => void;
};

export function LikeButton({
  likes,
  isLiked,
  accessibilityLabel,
  onPress,
}: LikeButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isLiked }}
      hitSlop={4}
      className={`h-6 flex-row items-center gap-1 rounded-full pl-2 pr-1 active:opacity-60 ${isLiked ? "bg-like/10" : "bg-pill"}`}
    >
      <Text
        className={`font-sans text-xs font-bold tabular-nums leading-4 ${isLiked ? "text-like" : "text-text-tertiary"}`}
      >
        {likes}
      </Text>
      <HeartIcon isFilled={isLiked} />
    </Pressable>
  );
}
