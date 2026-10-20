import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { slideTiming } from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";
import type { Timeframe } from "../../types/candle";

const timeframeOptions: Timeframe[] = [
  "1H",
  "1D",
  "1W",
  "1M",
  "3M",
  "6M",
  "1Y",
  "All",
];
const OPTION_GAP = 12;
const PILL_OVERHANG = 8;

type TimeframeSelectorProps = {
  selected: Timeframe;
  onChange: (timeframe: Timeframe) => void;
};

export function TimeframeSelector({
  selected,
  onChange,
}: TimeframeSelectorProps) {
  const optionWidth = useSharedValue(0);
  const pillIndex = useSharedValue(timeframeOptions.indexOf(selected));

  const handleLayout = (event: LayoutChangeEvent) => {
    const rowWidth = event.nativeEvent.layout.width;
    optionWidth.value =
      (rowWidth - OPTION_GAP * (timeframeOptions.length - 1)) /
      timeframeOptions.length;
  };

  const handlePress = (index: number) => {
    pillIndex.value = withTiming(index, slideTiming);
    onChange(timeframeOptions[index]);
  };

  const pillStyle = useAnimatedStyle(() => ({
    width: optionWidth.value + PILL_OVERHANG * 2,
    transform: [
      {
        translateX:
          pillIndex.value * (optionWidth.value + OPTION_GAP) - PILL_OVERHANG,
      },
    ],
  }));

  return (
    <View className="flex-1 pl-2 pr-4">
      <View onLayout={handleLayout} className="flex-row items-center gap-3">
        <Animated.View
          className="absolute left-0 h-6 rounded-full"
          style={[surfaces.pill, pillStyle]}
        />
        {timeframeOptions.map((timeframe, index) => {
          const isSelected = timeframe === selected;
          return (
            <Pressable
              key={timeframe}
              onPress={() => handlePress(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className="h-6 flex-1 items-center justify-center"
            >
              <Text
                className={`font-sans text-xs font-bold leading-4 ${isSelected ? "text-text-primary" : "text-text-secondary"}`}
              >
                {timeframe}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
