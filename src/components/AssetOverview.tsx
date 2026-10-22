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
import type { Market } from "../types/market";
import { ChartSection } from "./chart/ChartSection";
import { ScrubDetails } from "./chart/ScrubDetails";
import { PriceBlock } from "./price/PriceBlock";

type AssetOverviewProps = {
  market: Market;
  livePrice: SharedValue<number>;
};

export const AssetOverview = memo(function AssetOverview({
  market,
  livePrice,
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
    <View className="gap-6 pt-3">
      <View>
        <Animated.View style={priceFadeStyle}>
          <PriceBlock
            livePrice={livePrice}
            timeframeOpen={candles[0].open}
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
    </View>
  );
});
