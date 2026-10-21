import { memo, useState } from "react";
import { View } from "react-native";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

import type { Candle, ChartType, Timeframe } from "../../types/candle";
import { CandleChart } from "./CandleChart";
import { ChartTypeToggle } from "./ChartTypeToggle";
import { TimeframeSelector } from "./TimeframeSelector";

type ChartSectionProps = {
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
};

export const ChartSection = memo(function ChartSection({
  candles,
  timeframe,
  onTimeframeChange,
  scrubIndex,
  scrubProgress,
}: ChartSectionProps) {
  const [chartType, setChartType] = useState<ChartType>("candles");
  const drawProgress = useSharedValue(0);

  const handleTimeframeChange = (next: Timeframe) => {
    if (next === timeframe) {
      return;
    }
    drawProgress.value = 0;
    onTimeframeChange(next);
  };

  const handleChartTypePress = () => {
    setChartType(chartType === "candles" ? "line" : "candles");
  };

  return (
    <View className="gap-4">
      <CandleChart
        candles={candles}
        timeframe={timeframe}
        chartType={chartType}
        scrubIndex={scrubIndex}
        scrubProgress={scrubProgress}
        drawProgress={drawProgress}
      />
      <View className="flex-row items-center px-4">
        <TimeframeSelector
          selected={timeframe}
          onChange={handleTimeframeChange}
        />
        <ChartTypeToggle chartType={chartType} onPress={handleChartTypePress} />
      </View>
    </View>
  );
});
