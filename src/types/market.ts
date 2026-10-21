import type { ImageSourcePropType } from "react-native";

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
