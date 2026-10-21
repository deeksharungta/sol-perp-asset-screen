import type { ImageSourcePropType } from "react-native";

import type { Metric } from "./metric";

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
  initialMetric: Metric;
  fundingRate: number;
  maxLeverage: number;
};
