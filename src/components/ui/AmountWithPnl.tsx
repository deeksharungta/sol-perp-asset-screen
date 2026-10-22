import { Text, View } from "react-native";

import { typography } from "../../theme/typography";
import { formatUsd } from "../../utils/format";
import { PnlText } from "./PnlText";

type AmountWithPnlProps = {
  amount: number;
  pnl: number;
};

export function AmountWithPnl({ amount, pnl }: AmountWithPnlProps) {
  return (
    <View className="items-end gap-0.5">
      <Text
        style={typography.tabularNums}
        className="font-sans text-base font-semibold leading-5 text-text-primary"
      >
        {formatUsd(amount)}
      </Text>
      <PnlText value={pnl} />
    </View>
  );
}
