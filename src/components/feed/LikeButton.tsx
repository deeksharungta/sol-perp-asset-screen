import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  likeBurstTiming,
  likePopTiming,
  pressSpring,
} from "../../theme/animations";
import { typography } from "../../theme/typography";
import { HeartIcon } from "../icons/HeartIcon";

const LIKE_POP_SCALE = 1.3;
const UNLIKE_DIP_SCALE = 0.92;
const BURST_DOT_COUNT = 8;
const BURST_START_DISTANCE = 6;
const BURST_TRAVEL = 8;

type BurstDotShape = {
  angle: number;
  travel: number;
  scale: number;
};

function createBurst(): BurstDotShape[] {
  const slice = (Math.PI * 2) / BURST_DOT_COUNT;
  return Array.from({ length: BURST_DOT_COUNT }, (_, index) => ({
    angle: (index + Math.random() - 0.5) * slice,
    travel: BURST_TRAVEL * (0.5 + Math.random()),
    scale: 0.6 + Math.random() * 0.6,
  }));
}

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
  const burstProgress = useSharedValue(0);
  const [burst, setBurst] = useState<BurstDotShape[] | null>(null);

  const handlePress = () => {
    if (isLiked) {
      heartScale.value = withSequence(
        withTiming(UNLIKE_DIP_SCALE, likePopTiming),
        withTiming(1, likePopTiming),
      );
    } else {
      heartScale.value = withSequence(
        withTiming(LIKE_POP_SCALE, likePopTiming),
        withSpring(1, pressSpring),
      );
      setBurst(createBurst());
      burstProgress.value = 0;
      burstProgress.value = withTiming(1, likeBurstTiming, (finished) => {
        if (finished) {
          scheduleOnRN(setBurst, null);
        }
      });
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
      accessibilityValue={{ text: `${likes} likes` }}
      hitSlop={4}
      className={`h-6 flex-row items-center gap-1 rounded-full pl-2 pr-1.5 active:opacity-60 ${isLiked ? "bg-like/10" : "bg-pill"}`}
    >
      <Text
        maxFontSizeMultiplier={1.3}
        className={`font-sans text-xs font-bold leading-4 ${isLiked ? "text-like" : "text-text-tertiary"}`}
        style={typography.tabularNums}
      >
        {likes}
      </Text>
      <View>
        <Animated.View style={heartStyle}>
          <HeartIcon isFilled={isLiked} />
        </Animated.View>
        {burst && (
          <View className="pointer-events-none absolute inset-0 items-center justify-center">
            {burst.map((shape, index) => (
              <BurstDot key={index} shape={shape} progress={burstProgress} />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

type BurstDotProps = {
  shape: BurstDotShape;
  progress: SharedValue<number>;
};

function BurstDot({
  shape: { angle, travel, scale },
  progress,
}: BurstDotProps) {
  const dotStyle = useAnimatedStyle(() => {
    const distance = BURST_START_DISTANCE + progress.value * travel;
    return {
      opacity: interpolate(progress.value, [0, 0.2, 1], [0, 1, 0]),
      transform: [
        { translateX: Math.cos(angle) * distance },
        { translateY: Math.sin(angle) * distance },
        { scale: interpolate(progress.value, [0, 1], [scale, scale * 0.4]) },
      ],
    };
  });

  return (
    <Animated.View
      className="absolute h-1 w-1 rounded-full bg-like"
      style={dotStyle}
    />
  );
}
