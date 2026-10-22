import {
  Canvas,
  DashPathEffect,
  Group,
  Line,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { useChartScrub } from "../../hooks/useChartScrub";
import {
  chartMorphTiming,
  drawInTiming,
  timeframeZoomTiming,
} from "../../theme/animations";
import { colors } from "../../theme/colors";
import type { Candle, ChartType, Timeframe } from "../../types/candle";
import {
  buildChartPaths,
  getPriceRange,
  indexToX,
  priceToY,
  withLivePrice,
} from "../../utils/chartMath";
import { formatUsd } from "../../utils/format";
import { ChartLayer } from "./ChartLayer";
import { LiveDot } from "./LiveDot";
import { PriceAxis } from "./PriceAxis";
import { ScrubOverlay } from "./ScrubOverlay";

const PLOT_HEIGHT = 176;
const AXIS_WIDTH = 70;
const AXIS_RIGHT_INSET = 12;
const PRICE_LINE_OPACITY = 0.5;
const DASH_INTERVALS = [4, 4];

function describeCandles(candles: Candle[]) {
  const first = candles[0];
  const last = candles[candles.length - 1];
  return {
    range: getPriceRange(candles),
    lastClose: last.close,
    isUp: last.close >= first.open,
    span: last.time - first.time,
  };
}

type CandleChartProps = {
  candles: Candle[];
  timeframe: Timeframe;
  chartType: ChartType;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
  livePrice: SharedValue<number>;
};

export function CandleChart({
  candles: latestCandles,
  timeframe,
  chartType,
  scrubIndex,
  scrubProgress,
  livePrice,
}: CandleChartProps) {
  const canvasSize = useSharedValue({ width: 0, height: 0 });
  // The last timeframe's candles stay drawn so the chart can zoom from them to the new ones.
  const [candleSets, setCandleSets] = useState({
    candles: latestCandles,
    previousCandles: latestCandles,
  });
  const [isZooming, setIsZooming] = useState(false);
  if (!isZooming && candleSets.candles !== latestCandles) {
    setCandleSets({
      candles: latestCandles,
      previousCandles: candleSets.candles,
    });
    setIsZooming(true);
  }
  const { candles, previousCandles } = candleSets;

  const { range, lastClose, isUp, span } = describeCandles(candles);
  const {
    range: previousRange,
    isUp: isPreviousUp,
    span: previousSpan,
  } = describeCandles(previousCandles);
  const candleCount = candles.length;
  // The zoom runs in log space, so every frame scales by the same factor instead of crawling and then snapping at the end.
  const logRatio = Math.log(span / previousSpan);
  const priceColor = isUp ? colors.priceLineGreen : colors.priceLineRed;
  const previousPriceColor = isPreviousUp
    ? colors.priceLineGreen
    : colors.priceLineRed;

  const drawProgress = useSharedValue(0);
  const lineProgress = useSharedValue(chartType === "line" ? 1 : 0);
  const zoomProgress = useSharedValue(1);

  useEffect(() => {
    drawProgress.value = withTiming(1, drawInTiming);
  }, [drawProgress]);

  useEffect(() => {
    if (previousCandles === candles) {
      return;
    }
    zoomProgress.value = 0;
    zoomProgress.value = withTiming(1, timeframeZoomTiming, (finished) => {
      if (finished) {
        scheduleOnRN(setIsZooming, false);
      }
    });
  }, [candles, previousCandles, zoomProgress]);

  useEffect(() => {
    lineProgress.value = withTiming(
      chartType === "line" ? 1 : 0,
      chartMorphTiming,
    );
  }, [chartType, lineProgress]);

  const plotWidth = useDerivedValue(() => canvasSize.value.width - AXIS_WIDTH);
  const candleStep = useDerivedValue(() => plotWidth.value / candleCount);
  const minPrice = useDerivedValue(() =>
    interpolate(
      zoomProgress.value,
      [0, 1],
      [previousRange.minPrice, range.minPrice],
    ),
  );
  const maxPrice = useDerivedValue(() =>
    interpolate(
      zoomProgress.value,
      [0, 1],
      [previousRange.maxPrice, range.maxPrice],
    ),
  );

  const { scrubGesture, scrubX, scrubPrice } = useChartScrub({
    candles,
    candleStep,
    plotWidth,
    scrubIndex,
    scrubProgress,
    livePrice,
    enabled: candles === latestCandles,
  });

  // Snaps the live price to half a pixel, so ticks too small to see don't rebuild the paths.
  const chartPrice = useDerivedValue(() => {
    const step = (0.5 * (maxPrice.value - minPrice.value)) / PLOT_HEIGHT;
    return Math.round(livePrice.value / step) * step;
  });

  const sizes = useDerivedValue(() => ({
    candleStep: candleStep.value,
    plotHeight: PLOT_HEIGHT,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
  }));
  const paths = useDerivedValue(() =>
    buildChartPaths(
      candles,
      chartPrice.value,
      { ...sizes.value, zoom: Math.exp(logRatio * (1 - zoomProgress.value)) },
      { draw: drawProgress.value, line: lineProgress.value },
    ),
  );
  const previousPaths = useDerivedValue(() =>
    buildChartPaths(
      zoomProgress.value < 1 ? previousCandles : [],
      chartPrice.value,
      { ...sizes.value, zoom: Math.exp(-logRatio * zoomProgress.value) },
      { draw: 1, line: lineProgress.value },
    ),
  );
  const previousOpacity = useDerivedValue(() => 1 - zoomProgress.value);

  const lastPointX = useDerivedValue(() =>
    indexToX(candleCount - 1, candleStep.value),
  );
  const livePriceY = useDerivedValue(() =>
    priceToY(chartPrice.value, minPrice.value, maxPrice.value, PLOT_HEIGHT),
  );
  const tagPrice = useDerivedValue(() =>
    interpolate(
      scrubProgress.value,
      [0, 1],
      [livePrice.value, scrubPrice.value],
    ),
  );
  const tagY = useDerivedValue(() =>
    priceToY(
      interpolate(
        scrubProgress.value,
        [0, 1],
        [chartPrice.value, scrubPrice.value],
      ),
      minPrice.value,
      maxPrice.value,
      PLOT_HEIGHT,
    ),
  );
  const baseColor = useDerivedValue(() =>
    interpolateColor(
      zoomProgress.value,
      [0, 1],
      [previousPriceColor, priceColor],
    ),
  );
  const tagColor = useDerivedValue(() => {
    const index = scrubIndex.value;
    const candle =
      index === candleCount - 1
        ? withLivePrice(candles[index], livePrice.value)
        : candles[index];
    return interpolateColor(
      scrubProgress.value,
      [0, 1],
      [
        baseColor.value,
        candle.close >= candle.open
          ? colors.priceLineGreen
          : colors.priceLineRed,
      ],
    );
  });
  const priceLineStart = useDerivedValue(() => vec(0, tagY.value));
  const priceLineEnd = useDerivedValue(() =>
    vec(canvasSize.value.width - AXIS_RIGHT_INSET, tagY.value),
  );

  const lineOpacity = useDerivedValue(() =>
    interpolate(lineProgress.value, [0, 0.6], [0, 1], Extrapolation.CLAMP),
  );
  const revealOpacity = useDerivedValue(() =>
    interpolate(drawProgress.value, [0.6, 1], [0, 1], Extrapolation.CLAMP),
  );
  const axisFadeStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
  }));

  return (
    <View
      accessible
      accessibilityLabel={`SOL price chart, ${timeframe}, last ${formatUsd(lastClose)}`}
      className="py-2"
    >
      <GestureDetector gesture={scrubGesture}>
        <View style={{ height: PLOT_HEIGHT }}>
          <Canvas style={StyleSheet.absoluteFill} onSize={canvasSize}>
            <ChartLayer
              paths={previousPaths}
              isUp={isPreviousUp}
              opacity={previousOpacity}
              lineProgress={lineProgress}
              lineOpacity={lineOpacity}
              plotHeight={PLOT_HEIGHT}
            />
            <ChartLayer
              paths={paths}
              isUp={isUp}
              opacity={zoomProgress}
              lineProgress={lineProgress}
              lineOpacity={lineOpacity}
              plotHeight={PLOT_HEIGHT}
            />
            <Group opacity={lineOpacity}>
              <LiveDot
                x={lastPointX}
                y={livePriceY}
                color={baseColor}
                chartType={chartType}
              />
            </Group>
            <ScrubOverlay
              scrubIndex={scrubIndex}
              scrubX={scrubX}
              scrubProgress={scrubProgress}
              candleStep={candleStep}
              plotWidth={plotWidth}
              height={PLOT_HEIGHT}
            />
            <Group opacity={revealOpacity}>
              <Line
                p1={priceLineStart}
                p2={priceLineEnd}
                color={tagColor}
                strokeWidth={1}
                opacity={PRICE_LINE_OPACITY}
              >
                <DashPathEffect intervals={DASH_INTERVALS} />
              </Line>
            </Group>
          </Canvas>

          <Animated.View
            className="pointer-events-none absolute inset-0"
            style={axisFadeStyle}
          >
            <PriceAxis
              range={range}
              previousRange={previousRange}
              zoomProgress={zoomProgress}
              tagY={tagY}
              tagPrice={tagPrice}
              tagColor={tagColor}
              height={PLOT_HEIGHT}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}
