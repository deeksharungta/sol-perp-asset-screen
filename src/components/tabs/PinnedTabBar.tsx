import { memo, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { HeaderFade } from "../header/HeaderFade";
import { TabBar } from "./TabBar";

type PinnedTabBarProps = {
  scrollY: SharedValue<number>;
  tabRowY: SharedValue<number>;
  tabs: readonly string[];
  activeIndex: number;
  indicatorIndex: SharedValue<number>;
  onChange: (index: number) => void;
};

export const PinnedTabBar = memo(function PinnedTabBar({
  scrollY,
  tabRowY,
  tabs,
  activeIndex,
  indicatorIndex,
  onChange,
}: PinnedTabBarProps) {
  const [isTouchable, setIsTouchable] = useState(false);
  const isPinned = useDerivedValue(
    () => tabRowY.value > 0 && scrollY.value >= tabRowY.value,
  );

  useAnimatedReaction(
    () => isPinned.value,
    (pinned, wasPinned) => {
      if (pinned !== wasPinned) {
        scheduleOnRN(setIsTouchable, pinned);
      }
    },
  );

  const pinStyle = useAnimatedStyle(() => ({
    opacity: isPinned.value ? 1 : 0,
  }));

  return (
    <Animated.View
      aria-hidden
      className={`absolute left-0 right-0 top-0 bg-background ${isTouchable ? "pointer-events-auto" : "pointer-events-none"}`}
      style={pinStyle}
    >
      <TabBar
        tabs={tabs}
        activeIndex={activeIndex}
        indicatorIndex={indicatorIndex}
        onChange={onChange}
      />
      <View className="absolute left-0 right-0 top-full">
        <HeaderFade isVisible={isPinned} />
      </View>
    </Animated.View>
  );
});
