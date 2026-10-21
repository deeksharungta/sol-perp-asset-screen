import { memo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { slideTiming } from "../../theme/animations";
import { typography } from "../../theme/typography";
import type { Market } from "../../types/market";
import { formatPercentChange, formatPrice } from "../../utils/format";
import { BackIcon } from "../icons/BackIcon";
import { BellIcon } from "../icons/BellIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { AnimatedPriceChange } from "../ui/AnimatedPriceChange";
import { AnimatedText } from "../ui/AnimatedText";
import { IconButton } from "../ui/IconButton";

export const PRICE_PEEK_START = 320;
const PRICE_PEEK_SLIDE = 4;

type AssetHeaderProps = {
  market: Market;
  livePrice: SharedValue<number>;
  scrollY: SharedValue<number>;
  onTitlePress: () => void;
  onBack: () => void;
  onShare: () => void;
  onNotify: () => void;
};

export const AssetHeader = memo(function AssetHeader({
  market,
  livePrice,
  scrollY,
  onTitlePress,
  onBack,
  onShare,
  onNotify,
}: AssetHeaderProps) {
  const insets = useSafeAreaInsets();

  const priceText = useDerivedValue(() => formatPrice(livePrice.value));
  const changeText = useDerivedValue(() =>
    formatPercentChange(livePrice.value, market.openPrice),
  );
  const isUp = useDerivedValue(() => livePrice.value >= market.openPrice);
  const peekProgress = useSharedValue(0);
  useAnimatedReaction(
    () => scrollY.value > PRICE_PEEK_START,
    (isPeeking, wasPeeking) => {
      if (isPeeking !== wasPeeking) {
        peekProgress.value = withTiming(isPeeking ? 1 : 0, slideTiming);
      }
    },
  );
  const assetNameStyle = useAnimatedStyle(() => ({
    opacity: 1 - peekProgress.value,
    transform: [{ translateY: -peekProgress.value * PRICE_PEEK_SLIDE }],
  }));
  const priceStyle = useAnimatedStyle(() => ({
    opacity: peekProgress.value,
    transform: [{ translateY: (1 - peekProgress.value) * PRICE_PEEK_SLIDE }],
  }));

  return (
    <View
      className="flex-row items-center justify-between px-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center gap-3">
        <IconButton
          icon={<BackIcon />}
          onPress={onBack}
          accessibilityLabel="Go back"
        />

        <Pressable
          onPress={onTitlePress}
          accessibilityRole="button"
          accessibilityLabel={`${market.symbol}, scroll to top`}
          className="flex-row items-center gap-3 active:opacity-60"
        >
          <View>
            <Image source={market.assetIcon} className="h-9 w-9 rounded-full" />
            <Image
              source={market.exchangeIcon}
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border border-surface"
            />
          </View>

          <View>
            <Text className="font-sans text-base font-semibold leading-5 text-text-primary">
              {market.symbol}
            </Text>
            <View>
              <Animated.Text
                className="font-sans text-xs font-semibold leading-4 text-text-secondary"
                style={assetNameStyle}
              >
                {market.assetName}
              </Animated.Text>
              <Animated.View
                className="absolute left-0 top-0 flex-row items-center gap-1"
                style={priceStyle}
              >
                <AnimatedText
                  text={priceText}
                  className="font-sans text-xs font-semibold text-text-secondary"
                  style={typography.animatedTextXs}
                />
                <AnimatedPriceChange isUp={isUp} text={changeText} />
              </Animated.View>
            </View>
          </View>
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2">
        <IconButton
          icon={<ShareIcon />}
          onPress={onShare}
          accessibilityLabel="Share"
        />
        <IconButton
          icon={<BellIcon />}
          onPress={onNotify}
          accessibilityLabel="Notifications"
        />
      </View>
    </View>
  );
});
