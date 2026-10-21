import * as Haptics from "expo-haptics";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { slideTiming } from "../../theme/animations";
import { colors } from "../../theme/colors";

type TabBarProps = {
  tabs: readonly string[];
  activeIndex: number;
  indicatorIndex: SharedValue<number>;
  onChange: (index: number) => void;
};

export function TabBar({
  tabs,
  activeIndex,
  indicatorIndex,
  onChange,
}: TabBarProps) {
  const tabWidth = useSharedValue(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    tabWidth.value = event.nativeEvent.layout.width / tabs.length;
  };

  const handlePress = (index: number) => {
    if (index === activeIndex) {
      return;
    }
    Haptics.selectionAsync();
    indicatorIndex.set(withTiming(index, slideTiming));
    onChange(index);
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth.value,
    transform: [{ translateX: indicatorIndex.value * tabWidth.value }],
  }));

  return (
    <View accessibilityRole="tablist" className="px-4">
      <View className="flex-row">
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            onPress={() => handlePress(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: index === activeIndex }}
            className="flex-1 py-3"
          >
            <TabLabel label={tab} isActive={index === activeIndex} />
          </Pressable>
        ))}
      </View>
      <View onLayout={handleLayout} className="h-0.5 bg-divider">
        <Animated.View className="h-full bg-accent" style={indicatorStyle} />
      </View>
    </View>
  );
}

type TabLabelProps = {
  label: string;
  isActive: boolean;
};

function TabLabel({ label, isActive }: TabLabelProps) {
  const colorStyle = useAnimatedStyle(() => ({
    color: withTiming(
      isActive ? colors.textPrimary : colors.textSecondary,
      slideTiming,
    ),
  }));

  return (
    <Animated.Text
      className="text-center font-sans text-base font-semibold leading-5"
      style={colorStyle}
    >
      {label}
    </Animated.Text>
  );
}
