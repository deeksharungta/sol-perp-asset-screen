import { Fragment, type ReactNode } from "react";
import { Image, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { fadeInEntering } from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";
import type { Market } from "../../types/market";
import { formatCompactUsd, formatPercent, formatUsd } from "../../utils/format";
import { PriceChange } from "../price/PriceChange";
import { Divider } from "../ui/Divider";

const statValueClassName =
  "font-sans text-xs font-semibold tabular-nums leading-4 text-text-primary";

type AboutSectionProps = {
  market: Market;
};

export function AboutSection({ market }: AboutSectionProps) {
  const change = market.price - market.openPrice;
  const changePercent = (change / market.openPrice) * 100;

  const stats: { label: string; value: ReactNode }[] = [
    { label: "Mark price", value: formatUsd(market.price) },
    {
      label: "24h change",
      value: (
        <PriceChange isPositive={change >= 0}>
          {formatUsd(Math.abs(change))} (
          {formatPercent(Math.abs(changePercent))})
        </PriceChange>
      ),
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
          <Text className={statValueClassName}>{market.exchangeName}</Text>
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
                <Text className={statValueClassName}>{stat.value}</Text>
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
