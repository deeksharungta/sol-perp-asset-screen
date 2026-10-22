import { memo } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { typography } from "../../theme/typography";
import type { Market } from "../../types/market";
import { formatPercentChange, formatPrice } from "../../utils/format";
import { BackIcon } from "../icons/BackIcon";
import { BellIcon } from "../icons/BellIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { AnimatedPriceChange } from "../ui/AnimatedPriceChange";
import { AnimatedText } from "../ui/AnimatedText";
import { IconButton } from "../ui/IconButton";

const PRICE_PEEK_SLIDE = 4;

type AssetHeaderProps = {
  market: Market;
  livePrice: SharedValue<number>;
  pastChartProgress: SharedValue<number>;
  onTitlePress: () => void;
  onBackPress: () => void;
  onSharePress: () => void;
  onNotifyPress: () => void;
};

export const AssetHeader = memo(function AssetHeader({
  market,
  livePrice,
  pastChartProgress,
  onTitlePress,
  onBackPress,
  onSharePress,
  onNotifyPress,
}: AssetHeaderProps) {
  const insets = useSafeAreaInsets();

  const priceText = useDerivedValue(() => formatPrice(livePrice.value));
  const changeText = useDerivedValue(() =>
    formatPercentChange(livePrice.value, market.openPrice),
  );
  const isUp = useDerivedValue(() => livePrice.value >= market.openPrice);
  const assetNameStyle = useAnimatedStyle(() => ({
    opacity: 1 - pastChartProgress.value,
    transform: [{ translateY: -pastChartProgress.value * PRICE_PEEK_SLIDE }],
  }));
  const priceStyle = useAnimatedStyle(() => ({
    opacity: pastChartProgress.value,
    transform: [
      { translateY: (1 - pastChartProgress.value) * PRICE_PEEK_SLIDE },
    ],
  }));

  return (
    <View
      className="flex-row items-center justify-between px-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center gap-3">
        <IconButton
          icon={<BackIcon />}
          onPress={onBackPress}
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
          onPress={onSharePress}
          accessibilityLabel="Share"
        />
        <IconButton
          icon={<BellIcon />}
          onPress={onNotifyPress}
          accessibilityLabel="Notifications"
        />
      </View>
    </View>
  );
});
