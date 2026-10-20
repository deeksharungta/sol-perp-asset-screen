import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { slideTiming } from "../../theme/animations";

type TabBarProps = {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export function TabBar({ tabs, activeIndex, onChange }: TabBarProps) {
  const tabWidth = useSharedValue(0);
  const indicatorIndex = useSharedValue(activeIndex);

  const handleLayout = (event: LayoutChangeEvent) => {
    tabWidth.value = event.nativeEvent.layout.width / tabs.length;
  };

  const handlePress = (index: number) => {
    indicatorIndex.value = withTiming(index, slideTiming);
    onChange(index);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth.value,
    transform: [{ translateX: indicatorIndex.value * tabWidth.value }],
  }));

  return (
    <View accessibilityRole="tablist" className="px-4">
      <View className="flex-row">
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab}
              onPress={() => handlePress(index)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              className="flex-1 py-3"
            >
              <Text
                className={`text-center font-sans text-base font-semibold leading-5 ${isActive ? "text-text-primary" : "text-text-secondary"}`}
              >
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View onLayout={handleLayout} className="h-0.5 bg-black/10">
        <Animated.View className="h-full bg-accent" style={indicatorStyle} />
      </View>
    </View>
  );
}
