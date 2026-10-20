import { View } from "react-native";

import hyperliquidIcon from "../../assets/images/hyperliquid.png";
import solanaIcon from "../../assets/images/solana.png";
import { AssetHeader } from "../components/header/AssetHeader";

export function AssetDetailScreen() {
  const handleBack = () => {};

  const handleShare = () => {};

  const handleNotify = () => {};

  return (
    <View className="flex-1 bg-background">
      <AssetHeader
        symbol="SOL-PERP"
        assetName="Solana"
        assetIcon={solanaIcon}
        exchangeIcon={hyperliquidIcon}
        onBack={handleBack}
        onShare={handleShare}
        onNotify={handleNotify}
      />
    </View>
  );
}
