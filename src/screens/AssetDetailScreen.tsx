import { BlurTargetView } from "expo-blur";
import { useRef, useState, type ComponentRef } from "react";
import { View } from "react-native";

import { FeedFilters } from "../components/feed/FeedFilters";
import { AssetHeader } from "../components/header/AssetHeader";
import { PriceSection } from "../components/price/PriceSection";
import { TabBar } from "../components/tabs/TabBar";
import { TradeBar } from "../components/trade/TradeBar";
import { solPerpMarket } from "../data/market";

const assetTabs = ["Feed", "Holders", "About"];

export function AssetDetailScreen() {
  const market = solPerpMarket;
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isFollowingOnly, setIsFollowingOnly] = useState(true);

  const handleBack = () => {};

  const handleShare = () => {};

  const handleNotify = () => {};

  const handleSortPress = () => {};

  const handleGoLong = () => {};

  const handleGoShort = () => {};

  return (
    <View className="flex-1 bg-background">
      {/* Android only blurs what is inside a BlurTargetView, so the content is wrapped for the trade bar. */}
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
        <View className="flex-1 gap-6">
          <AssetHeader
            symbol={market.symbol}
            assetName={market.assetName}
            assetIcon={market.assetIcon}
            exchangeIcon={market.exchangeIcon}
            onBack={handleBack}
            onShare={handleShare}
            onNotify={handleNotify}
          />
          <PriceSection
            price={market.price}
            openPrice={market.openPrice}
            timeframe={market.timeframe}
            metrics={market.metrics}
            initialMetric={market.initialMetric}
          />
          <View className="gap-4">
            <TabBar
              tabs={assetTabs}
              activeIndex={activeTabIndex}
              onChange={setActiveTabIndex}
            />
            <FeedFilters
              isFollowingOnly={isFollowingOnly}
              onFollowingOnlyChange={setIsFollowingOnly}
              onSortPress={handleSortPress}
            />
          </View>
        </View>
      </BlurTargetView>

      <TradeBar
        blurTarget={blurTargetRef}
        onGoLong={handleGoLong}
        onGoShort={handleGoShort}
      />
    </View>
  );
}
