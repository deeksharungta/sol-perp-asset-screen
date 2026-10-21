import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { colors } from "../../theme/colors";
import { TriangleIcon } from "../icons/TriangleIcon";

type PriceChangeProps = {
  isPositive: boolean;
  children: ReactNode;
};

export function PriceChange({ isPositive, children }: PriceChangeProps) {
  return (
    <View className="flex-row items-center gap-0.5">
      <TriangleIcon
        direction={isPositive ? "up" : "down"}
        color={isPositive ? colors.textGreen : colors.textRed}
      />
      <Text
        className={`font-sans text-xs font-semibold tabular-nums leading-4 ${isPositive ? "text-text-green" : "text-text-red"}`}
      >
        {children}
      </Text>
    </View>
  );
}
