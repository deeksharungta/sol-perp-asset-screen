import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { slideTiming } from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";
import { timeframes, type Timeframe } from "../../types/candle";

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
  const pillIndex = useSharedValue(timeframes.indexOf(selected));

  const handleLayout = (event: LayoutChangeEvent) => {
    const rowWidth = event.nativeEvent.layout.width;
    optionWidth.value =
      (rowWidth - OPTION_GAP * (timeframes.length - 1)) / timeframes.length;
  };

  const handlePress = (index: number) => {
    pillIndex.value = withTiming(index, slideTiming);
    onChange(timeframes[index]);
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
        {timeframes.map((timeframe, index) => {
          const isSelected = timeframe === selected;
          return (
            <Pressable
              key={timeframe}
              onPress={() => handlePress(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
              className="h-6 flex-1 items-center justify-center"
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                maxFontSizeMultiplier={1.3}
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
