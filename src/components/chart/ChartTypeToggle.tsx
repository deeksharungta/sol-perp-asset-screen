import { Pressable } from "react-native";

import { surfaces } from "../../theme/surfaces";
import type { ChartType } from "../../types/candle";
import { CandlesIcon } from "../icons/CandlesIcon";
import { LineChartIcon } from "../icons/LineChartIcon";

type ChartTypeToggleProps = {
  chartType: ChartType;
  onPress: () => void;
};

export function ChartTypeToggle({ chartType, onPress }: ChartTypeToggleProps) {
  const isCandles = chartType === "candles";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isCandles ? "Show line chart" : "Show candlestick chart"
      }
      hitSlop={8}
      className="h-6 w-10 items-center justify-center rounded-full"
      style={surfaces.pill}
    >
      {isCandles ? <LineChartIcon /> : <CandlesIcon />}
    </Pressable>
  );
}
