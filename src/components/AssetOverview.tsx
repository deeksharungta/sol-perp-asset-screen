import { memo, useState } from "react";
import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import { candlesByTimeframe } from "../data/candles";
import type { Timeframe } from "../types/candle";
import type { AssetTab, Market } from "../types/market";
import { ChartSection } from "./chart/ChartSection";
import { ScrubDetails } from "./chart/ScrubDetails";
import { FeedFilters } from "./feed/FeedFilters";
import { PriceSection } from "./price/PriceSection";
import { TabBar } from "./tabs/TabBar";

type AssetOverviewProps = {
  market: Market;
  livePrice: SharedValue<number>;
  tabs: readonly AssetTab[];
  activeTabIndex: number;
  onTabChange: (index: number) => void;
  showFeedFilters: boolean;
  isFollowingOnly: boolean;
  onFollowingOnlyChange: (value: boolean) => void;
  isLargestFirst: boolean;
  onSortPress: () => void;
};

export const AssetOverview = memo(function AssetOverview({
  market,
  livePrice,
  tabs,
  activeTabIndex,
  onTabChange,
  showFeedFilters,
  isFollowingOnly,
  onFollowingOnlyChange,
  isLargestFirst,
  onSortPress,
}: AssetOverviewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const candles = candlesByTimeframe[timeframe];
  // Shared with the chart so the scrub panel can replace the price block without re-renders.
  const scrubIndex = useSharedValue(0);
  const scrubProgress = useSharedValue(0);

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
          livePrice={livePrice}
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
        {showFeedFilters && (
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
});
