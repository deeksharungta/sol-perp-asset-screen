import { useState } from "react";
import type { SharedValue } from "react-native-reanimated";

import type { Metric } from "../../types/metric";
import { MetricSheet } from "./MetricSheet";
import { PriceBlock } from "./PriceBlock";

type PriceSectionProps = {
  livePrice: SharedValue<number>;
  openPrice: number;
  timeframe: string;
  metrics: Metric[];
};

export function PriceSection({
  livePrice,
  openPrice,
  timeframe,
  metrics,
}: PriceSectionProps) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0]);
  const [isMetricSheetOpen, setIsMetricSheetOpen] = useState(false);
  const [metricSheetAnchorY, setMetricSheetAnchorY] = useState(0);

  const handleOpenMetrics = (anchorY: number) => {
    setMetricSheetAnchorY(anchorY);
    setIsMetricSheetOpen(true);
  };

  const handleSelectMetric = (metric: Metric) => {
    setSelectedMetric(metric);
    setIsMetricSheetOpen(false);
  };

  const handleCloseMetrics = () => {
    setIsMetricSheetOpen(false);
  };

  return (
    <>
      <PriceBlock
        livePrice={livePrice}
        openPrice={openPrice}
        timeframe={timeframe}
        metric={selectedMetric}
        onOpenMetrics={handleOpenMetrics}
      />
      <MetricSheet
        visible={isMetricSheetOpen}
        metrics={metrics}
        anchorY={metricSheetAnchorY}
        onSelect={handleSelectMetric}
        onClose={handleCloseMetrics}
      />
    </>
  );
}
