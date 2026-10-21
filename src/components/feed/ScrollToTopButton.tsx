import { memo, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedReaction,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { fadeInEntering, fadeOutExiting } from "../../theme/animations";
import { colors } from "../../theme/colors";
import { surfaces } from "../../theme/surfaces";
import { ArrowDownIcon } from "../icons/ArrowDownIcon";
import { IconButton } from "../ui/IconButton";

const SHOW_AFTER_OFFSET = 400;

type ScrollToTopButtonProps = {
  scrollY: SharedValue<number>;
  bottom: number;
  onPress: () => void;
};

export const ScrollToTopButton = memo(function ScrollToTopButton({
  scrollY,
  bottom,
  onPress,
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useAnimatedReaction(
    () => scrollY.value > SHOW_AFTER_OFFSET,
    (shouldShow, wasShown) => {
      if (shouldShow !== wasShown) {
        scheduleOnRN(setIsVisible, shouldShow);
      }
    },
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      entering={fadeInEntering}
      exiting={fadeOutExiting}
      className="absolute right-4"
      style={{ bottom }}
    >
      <IconButton
        icon={
          <View className="rotate-180">
            <ArrowDownIcon color={colors.textPrimary} />
          </View>
        }
        onPress={onPress}
        accessibilityLabel="Scroll to top"
        style={surfaces.floating}
      />
    </Animated.View>
  );
});
