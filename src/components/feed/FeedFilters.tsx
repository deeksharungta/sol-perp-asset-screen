import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { slideTiming } from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";
import { ArrowDownIcon } from "../icons/ArrowDownIcon";
import { Toggle } from "../ui/Toggle";

type FeedFiltersProps = {
  isFollowingOnly: boolean;
  onFollowingOnlyChange: (value: boolean) => void;
  isLargestFirst: boolean;
  onSortPress: () => void;
};

export function FeedFilters({
  isFollowingOnly,
  onFollowingOnlyChange,
  isLargestFirst,
  onSortPress,
}: FeedFiltersProps) {
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: withTiming(isLargestFirst ? "0deg" : "180deg", slideTiming) },
    ],
  }));

  return (
    <View className="flex-row items-center justify-between px-4">
      <View className="flex-row items-center gap-2">
        <Toggle
          value={isFollowingOnly}
          onValueChange={onFollowingOnlyChange}
          accessibilityLabel="People you follow"
        />
        <Text className="font-sans text-base font-semibold leading-5 text-text-primary">
          People you follow
        </Text>
      </View>

      <Pressable
        onPress={onSortPress}
        accessibilityRole="button"
        accessibilityLabel={`Sort by size, ${isLargestFirst ? "largest" : "smallest"} first`}
        hitSlop={8}
        className="h-6 flex-row items-center gap-1 rounded-full px-2"
        style={surfaces.pill}
      >
        <Text className="font-sans text-xs font-bold leading-4 text-text-secondary">
          Size
        </Text>
        <Animated.View style={arrowStyle}>
          <ArrowDownIcon />
        </Animated.View>
      </Pressable>
    </View>
  );
}
