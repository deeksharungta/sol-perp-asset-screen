import { View } from "react-native";

import { AssetHeader } from "../components/header/AssetHeader";
import { PriceSection } from "../components/price/PriceSection";
import { solPerpMarket } from "../data/market";

export function AssetDetailScreen() {
  const market = solPerpMarket;

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
    </View>
  );
}
