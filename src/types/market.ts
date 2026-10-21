import type { ImageSourcePropType } from "react-native";

export const assetTabs = ["Feed", "Holders", "About"] as const;

export type AssetTab = (typeof assetTabs)[number];

export type Metric = {
  label: string;
  value: number;
};

export type Market = {
  symbol: string;
  assetName: string;
  assetIcon: ImageSourcePropType;
  exchangeIcon: ImageSourcePropType;
  exchangeName: string;
  description: string;
  price: number;
  openPrice: number;
  metrics: Metric[];
  fundingRate: number;
  maxLeverage: number;
};
