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
    "Solana is a high-throughput layer 1 blockchain built for fast, low-cost transactions. SOL is its native token, used for fees and staking. This perpetual tracks the SOL price with up to 20x leverage.",
  price: 171.2,
  openPrice: 163.77,
  metrics: [
    { label: "Open interest", value: 3_260_000_000 },
    { label: "24h volume", value: 4_050_000_000 },
  ],
  initialMetric: { label: "Open interest", value: 178.63 },
  fundingRate: 0.0013,
  maxLeverage: 20,
};
