import hyperliquidIcon from "../../assets/images/hyperliquid.png";
import solanaIcon from "../../assets/images/solana.png";
import type { Market } from "../types/market";

export const solPerpMarket: Market = {
  symbol: "SOL-PERP",
  assetName: "Solana",
  assetIcon: solanaIcon,
  exchangeIcon: hyperliquidIcon,
  exchangeName: "Hyperliquid",
  description:
    "SOL is the token of the Solana blockchain. This perpetual tracks its price on Hyperliquid, with up to 20x leverage.",
  price: 171.2,
  openPrice: 163.77,
  metrics: [
    { label: "Open interest", value: 178.63 },
    { label: "24h volume", value: 4_050_000_000 },
  ],
  fundingRate: 0.0013,
  maxLeverage: 20,
};
