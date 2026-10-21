import { Text } from "react-native";
import Animated from "react-native-reanimated";

import { toastEntering, toastExiting } from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";

type ToastProps = {
  message: string;
  bottom: number;
};

export function Toast({ message, bottom }: ToastProps) {
  return (
    <Animated.View
      entering={toastEntering}
      exiting={toastExiting}
      className="pointer-events-none absolute self-center rounded-full px-4 py-2"
      style={[surfaces.floating, { bottom }]}
    >
      <Text className="font-sans text-sm font-semibold leading-5 text-text-primary">
        {message}
      </Text>
    </Animated.View>
  );
}
