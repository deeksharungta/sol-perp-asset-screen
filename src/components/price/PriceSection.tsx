import { useState } from "react";

import type { Metric } from "../../types/metric";
import { MetricSheet } from "./MetricSheet";
import { PriceBlock } from "./PriceBlock";

type PriceSectionProps = {
  price: number;
  openPrice: number;
  timeframe: string;
  metrics: Metric[];
  initialMetric: Metric;
};

export function PriceSection({
  price,
  openPrice,
  timeframe,
  metrics,
  initialMetric,
}: PriceSectionProps) {
  const [selectedMetric, setSelectedMetric] = useState(initialMetric);
  const [isMetricSheetOpen, setIsMetricSheetOpen] = useState(false);
  const [metricSheetAnchorY, setMetricSheetAnchorY] = useState(0);

  const change = price - openPrice;
  const changePercent = (change / openPrice) * 100;

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
        price={price}
        change={change}
        changePercent={changePercent}
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
