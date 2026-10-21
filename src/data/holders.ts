import type { Holder } from "../types/holder";

import { avatars } from "./avatars";
import { traderPosts } from "./traderPosts";

const orderflow: Holder = {
  id: "orderflow",
  name: "orderflow",
  avatar: avatars.orderflow,
  isVerified: true,
  side: "short",
  leverage: 3,
  size: 312_500,
  pnl: 9_212.02,
};

export const holders: Holder[] = [
  orderflow,
  ...traderPosts.map((post) => ({
    id: post.id,
    name: post.traderName,
    avatar: post.avatar,
    isVerified: post.isVerified,
    side: post.side,
    leverage: post.leverage,
    size: post.positionValue,
    pnl: post.pnl,
  })),
].sort((a, b) => b.size - a.size);
