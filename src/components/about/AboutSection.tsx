import { Fragment, type ReactNode } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { fadeInEntering } from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";
import { typography } from "../../theme/typography";
import type { Market } from "../../types/market";
import {
  formatCompactUsd,
  formatPrice,
  formatPriceChange,
} from "../../utils/format";
import { AnimatedPriceChange } from "../price/AnimatedPriceChange";
import { AnimatedText } from "../ui/AnimatedText";
import { Divider } from "../ui/Divider";

const statValueClassName =
  "font-sans text-xs font-semibold leading-4 text-text-primary";

type AboutSectionProps = {
  market: Market;
  livePrice: SharedValue<number>;
};

export function AboutSection({ market, livePrice }: AboutSectionProps) {
  const priceText = useDerivedValue(() => formatPrice(livePrice.value));
  const changeText = useDerivedValue(() =>
    formatPriceChange(livePrice.value, market.openPrice),
  );
  const isUp = useDerivedValue(() => livePrice.value >= market.openPrice);

  const stats: { label: string; value: ReactNode }[] = [
    {
      label: "Mark price",
      value: (
        <AnimatedText
          text={priceText}
          className="font-sans text-xs font-semibold text-text-primary"
          style={[typography.tabularNums, typography.animatedTextXs]}
        />
      ),
    },
    {
      label: "24h change",
      value: <AnimatedPriceChange isUp={isUp} text={changeText} />,
    },
    ...market.metrics.map((metric) => ({
      label: metric.label,
      value: formatCompactUsd(metric.value),
    })),
    { label: "Funding rate", value: `${market.fundingRate}%/h` },
    { label: "Max leverage", value: `${market.maxLeverage}x` },
    {
      label: "Exchange",
      value: (
        <View className="flex-row items-center gap-1.5">
          <Image
            source={market.exchangeIcon}
            className="h-4 w-4 rounded-full"
          />
          <Text className={statValueClassName} style={typography.tabularNums}>
            {market.exchangeName}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <Animated.View entering={fadeInEntering} className="gap-2">
      <View className="gap-2 rounded-3xl bg-surface p-4" style={surfaces.card}>
        <Text className="font-sans text-base font-semibold leading-5 text-text-primary">
          About {market.assetName}
        </Text>
        <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
          {market.description}
        </Text>
      </View>

      <View className="rounded-3xl bg-surface px-4" style={surfaces.card}>
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && <Divider />}
            <View className="flex-row items-center justify-between py-3">
              <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
                {stat.label}
              </Text>
              {typeof stat.value === "string" ? (
                <Text
                  className={statValueClassName}
                  style={typography.tabularNums}
                >
                  {stat.value}
                </Text>
              ) : (
                stat.value
              )}
            </View>
          </Fragment>
        ))}
      </View>
    </Animated.View>
  );
}
