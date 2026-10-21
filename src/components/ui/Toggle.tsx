import { useRef } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { slideTiming } from "../../theme/animations";
import { colors } from "../../theme/colors";

const TRACK_WIDTH = 40;
const KNOB_SIZE = 18;
const KNOB_INSET = 3;
const KNOB_TRAVEL = TRACK_WIDTH - KNOB_SIZE - KNOB_INSET * 2;

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

export function Toggle({
  value,
  onValueChange,
  accessibilityLabel,
}: ToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);
  const nextValue = useRef(value);

  const handlePress = () => {
    const isOn = !nextValue.current;
    nextValue.current = isOn;
    progress.value = withTiming(isOn ? 1 : 0, slideTiming, (finished) => {
      if (finished) {
        scheduleOnRN(onValueChange, isOn);
      }
    });
  };

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.toggleOff, colors.accent],
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * KNOB_TRAVEL }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Animated.View
        className="h-6 justify-center rounded-full"
        style={[styles.track, trackStyle]}
      >
        <Animated.View
          className="rounded-full bg-surface"
          style={[styles.knob, knobStyle]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    paddingHorizontal: KNOB_INSET,
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    boxShadow: `0 0 0 1px ${colors.knobOutline}, 0 1px 1px ${colors.knobShadow}`,
  },
});
