import { Text } from "react-native";

import { typography } from "../../theme/typography";
import { formatSignedUsd } from "../../utils/format";

type PnlTextProps = {
  value: number;
};

export function PnlText({ value }: PnlTextProps) {
  return (
    <Text
      style={typography.tabularNums}
      className={`font-sans text-xs font-semibold leading-4 ${value < 0 ? "text-text-red" : "text-text-green"}`}
    >
      {formatSignedUsd(value)}
    </Text>
  );
}
