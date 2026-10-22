import { Fragment, type ReactNode } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { fadeInEntering } from "../../theme/animations";
import { typography } from "../../theme/typography";
import type { Market } from "../../types/market";
import {
  formatCompactUsd,
  formatPrice,
  formatPriceChange,
  formatUsd,
} from "../../utils/format";
import { AnimatedPriceChange } from "../ui/AnimatedPriceChange";
import { AnimatedText } from "../ui/AnimatedText";
import { Card } from "../ui/Card";
import { Divider } from "../ui/Divider";

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

  const stats: {
    label: string;
    value: ReactNode;
    accessibilityLabel?: string;
  }[] = [
    {
      label: "Mark price",
      accessibilityLabel: `${market.symbol} mark price ${formatUsd(market.price)}`,
      value: (
        <AnimatedText
          text={priceText}
          className="font-sans text-xs font-semibold text-text-primary"
          style={typography.animatedTextXs}
        />
      ),
    },
    {
      label: "24h change",
      accessibilityLabel: `${market.symbol} 24h change ${market.price >= market.openPrice ? "up" : "down"} ${formatPriceChange(market.price, market.openPrice)}`,
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
          <Text className="font-sans text-xs font-semibold leading-4 text-text-primary">
            {market.exchangeName}
          </Text>
        </View>
      ),
    },
  ];

  return (
    <Animated.View entering={fadeInEntering} className="gap-2">
      <Card className="gap-2 p-4">
        <Text className="font-sans text-base font-semibold leading-5 text-text-primary">
          About {market.assetName}
        </Text>
        <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
          {market.description}
        </Text>
      </Card>

      <Card className="px-4">
        {stats.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && <Divider />}
            <View
              accessible={!!stat.accessibilityLabel}
              accessibilityLabel={stat.accessibilityLabel}
              className="flex-row items-center justify-between py-3"
            >
              <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
                {stat.label}
              </Text>
              {typeof stat.value === "string" ? (
                <Text
                  className="font-sans text-xs font-semibold leading-4 text-text-primary"
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
      </Card>
    </Animated.View>
  );
}
