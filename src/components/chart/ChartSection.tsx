import { memo, useState } from "react";
import { View } from "react-native";

import type { Candle, ChartType, Timeframe } from "../../types/candle";
import { CandleChart } from "./CandleChart";
import { ChartTypeToggle } from "./ChartTypeToggle";
import { TimeframeSelector } from "./TimeframeSelector";

type ChartSectionProps = {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
};

export const ChartSection = memo(function ChartSection({
  candles,
  timeframe,
  onTimeframeChange,
}: ChartSectionProps) {
  const [chartType, setChartType] = useState<ChartType>("candles");

  const handleChartTypePress = () => {
    setChartType(chartType === "candles" ? "line" : "candles");
  };

  return (
    <View className="gap-4">
      <CandleChart
        candles={candles}
        timeframe={timeframe}
        chartType={chartType}
      />
      <View className="flex-row items-center px-4">
        <TimeframeSelector selected={timeframe} onChange={onTimeframeChange} />
        <ChartTypeToggle chartType={chartType} onPress={handleChartTypePress} />
      </View>
    </View>
  );
});
