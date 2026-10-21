import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { likePopTiming, pressSpring } from "../../theme/animations";
import { typography } from "../../theme/typography";
import { HeartIcon } from "../icons/HeartIcon";

const LIKE_POP_SCALE = 1.3;

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
  const heartScale = useSharedValue(1);

  const handlePress = () => {
    if (!isLiked) {
      heartScale.value = withSequence(
        withTiming(LIKE_POP_SCALE, likePopTiming),
        withSpring(1, pressSpring),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isLiked }}
      hitSlop={4}
      className={`h-6 flex-row items-center gap-1 rounded-full pl-2 pr-1.5 active:opacity-60 ${isLiked ? "bg-like/10" : "bg-pill"}`}
    >
      <Text
        className={`font-sans text-xs font-bold leading-4 ${isLiked ? "text-like" : "text-text-tertiary"}`}
        style={typography.tabularNums}
      >
        {likes}
      </Text>
      <Animated.View style={heartStyle}>
        <HeartIcon isFilled={isLiked} />
      </Animated.View>
    </Pressable>
  );
}
