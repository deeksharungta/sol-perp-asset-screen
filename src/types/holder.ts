import type { ImageSourcePropType } from "react-native";

import type { TradeSide } from "./traderPost";

export type Holder = {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
  isVerified: boolean;
  side: TradeSide;
  leverage: number;
  size: number;
  pnl: number;
};
