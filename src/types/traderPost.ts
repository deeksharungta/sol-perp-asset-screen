import type { ImageSourcePropType } from "react-native";

export type TradeSide = "long" | "short";

export type OlderPost = {
  id: string;
  side: TradeSide;
  leverage: number;
  thesis: string;
  pnl: number;
  closedAt: number;
};

export type TraderPost = {
  id: string;
  traderName: string;
  avatar: ImageSourcePropType;
  isVerified: boolean;
  isFollowed: boolean;
  rank: number;
  winRate: number;
  accountValue: number;
  side: TradeSide;
  leverage: number;
  positionValue: number;
  pnl: number;
  thesis?: string;
  avgEntry: number;
  takeProfit: number;
  stopLoss: number;
  liqPrice: number;
  likes: number;
  isLiked: boolean;
  commentCount: number;
  copyingCount: number;
  olderPosts?: OlderPost[];
};
