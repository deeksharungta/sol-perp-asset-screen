import { Text } from "react-native";

import type { TradeSide } from "../../types/traderPost";

type SideLabelProps = {
  side: TradeSide;
  leverage: number;
};

export function SideLabel({ side, leverage }: SideLabelProps) {
  const isLong = side === "long";
  return (
    <Text
      className={`font-sans text-xs font-bold leading-4 ${isLong ? "text-text-green" : "text-text-red"}`}
    >
      {isLong ? "Long" : "Short"} {leverage}x
    </Text>
  );
}
