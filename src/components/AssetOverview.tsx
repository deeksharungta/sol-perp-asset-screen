import { useState } from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { candlesByTimeframe } from "../data/candles";
import type { Timeframe } from "../types/candle";
import type { Market } from "../types/market";
import { ChartSection } from "./chart/ChartSection";
import { ScrubDetails } from "./chart/ScrubDetails";
import { FeedFilters } from "./feed/FeedFilters";
import { PriceSection } from "./price/PriceSection";
import { TabBar } from "./tabs/TabBar";

type AssetOverviewProps = {
  market: Market;
  livePrice: SharedValue<number>;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
  tabs: string[];
  activeTabIndex: number;
  onTabChange: (index: number) => void;
  isFollowingOnly: boolean;
  onFollowingOnlyChange: (value: boolean) => void;
  isLargestFirst: boolean;
  onSortPress: () => void;
};

export function AssetOverview({
  market,
  livePrice,
  scrubIndex,
  scrubProgress,
  tabs,
  activeTabIndex,
  onTabChange,
  isFollowingOnly,
  onFollowingOnlyChange,
  isLargestFirst,
  onSortPress,
}: AssetOverviewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const candles = candlesByTimeframe[timeframe];

  const priceFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrubProgress.value,
      [0, 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View className="gap-6 pb-4 pt-3">
      <View>
        <Animated.View style={priceFadeStyle}>
          <PriceSection
            livePrice={livePrice}
            openPrice={candles[0].open}
            timeframe={timeframe}
            metrics={market.metrics}
          />
        </Animated.View>
        <ScrubDetails
          candles={candles}
          timeframe={timeframe}
          scrubIndex={scrubIndex}
          scrubProgress={scrubProgress}
        />
      </View>
      <ChartSection
        candles={candles}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        scrubIndex={scrubIndex}
        scrubProgress={scrubProgress}
        livePrice={livePrice}
      />
      <View className="gap-4">
        <TabBar
          tabs={tabs}
          activeIndex={activeTabIndex}
          onChange={onTabChange}
        />
        {tabs[activeTabIndex] === "Feed" && (
          <FeedFilters
            isFollowingOnly={isFollowingOnly}
            onFollowingOnlyChange={onFollowingOnlyChange}
            isLargestFirst={isLargestFirst}
            onSortPress={onSortPress}
          />
        )}
      </View>
    </View>
  );
}
