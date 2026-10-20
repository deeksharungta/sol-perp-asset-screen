import { useState } from "react";
import { View } from "react-native";

import { AssetHeader } from "../components/header/AssetHeader";
import { PriceSection } from "../components/price/PriceSection";
import { TabBar } from "../components/tabs/TabBar";
import { solPerpMarket } from "../data/market";

const assetTabs = ["Feed", "Holders", "About"];

export function AssetDetailScreen() {
  const market = solPerpMarket;
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const handleBack = () => {};

  const handleShare = () => {};

  const handleNotify = () => {};

  return (
    <View className="flex-1 gap-6 bg-background">
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
      <TabBar
        tabs={assetTabs}
        activeIndex={activeTabIndex}
        onChange={setActiveTabIndex}
      />
    </View>
  );
}
