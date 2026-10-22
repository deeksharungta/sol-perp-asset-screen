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
  candleAt,
  getPriceRange,
  indexToX,
  PLOT_HEIGHT,
  priceToY,
} from "../../utils/chartMath";
import { formatUsd } from "../../utils/format";
import { ChartLayer } from "./ChartLayer";
import { LiveDot } from "./LiveDot";
import { AXIS_RIGHT_INSET, PriceAxis } from "./PriceAxis";
import { ScrubOverlay } from "./ScrubOverlay";

const AXIS_WIDTH = 70;
const PRICE_LINE_OPACITY = 0.5;
const DASH_INTERVALS = [4, 4];

function getCandleStats(candles: Candle[]) {
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

  const { range, lastClose, isUp, span } = getCandleStats(candles);
  const {
    range: previousRange,
    isUp: isPreviousUp,
    span: previousSpan,
  } = getCandleStats(previousCandles);
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
    drawProgress.set(withTiming(1, drawInTiming));
  }, [drawProgress]);

  useEffect(() => {
    if (previousCandles === candles) {
      return;
    }
    zoomProgress.set(0);
    zoomProgress.set(
      withTiming(1, timeframeZoomTiming, (finished) => {
        if (finished) {
          scheduleOnRN(setIsZooming, false);
        }
      }),
    );
  }, [candles, previousCandles, zoomProgress]);

  useEffect(() => {
    lineProgress.set(
      withTiming(chartType === "line" ? 1 : 0, chartMorphTiming),
    );
  }, [chartType, lineProgress]);

  const plotWidth = useDerivedValue(() => canvasSize.get().width - AXIS_WIDTH);
  const candleStep = useDerivedValue(() => plotWidth.get() / candleCount);
  const minPrice = useDerivedValue(() =>
    interpolate(
      zoomProgress.get(),
      [0, 1],
      [previousRange.minPrice, range.minPrice],
    ),
  );
  const maxPrice = useDerivedValue(() =>
    interpolate(
      zoomProgress.get(),
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
    const step = (0.5 * (maxPrice.get() - minPrice.get())) / PLOT_HEIGHT;
    return Math.round(livePrice.get() / step) * step;
  });

  const chartScale = useDerivedValue(() => ({
    candleStep: candleStep.get(),
    minPrice: minPrice.get(),
    maxPrice: maxPrice.get(),
  }));
  const paths = useDerivedValue(() =>
    buildChartPaths(
      candles,
      chartPrice.get(),
      {
        ...chartScale.get(),
        zoom: Math.exp(logRatio * (1 - zoomProgress.get())),
      },
      { draw: drawProgress.get(), line: lineProgress.get() },
    ),
  );
  const previousPaths = useDerivedValue(() =>
    buildChartPaths(
      zoomProgress.get() < 1 ? previousCandles : [],
      chartPrice.get(),
      { ...chartScale.get(), zoom: Math.exp(-logRatio * zoomProgress.get()) },
      { draw: 1, line: lineProgress.get() },
    ),
  );
  const previousOpacity = useDerivedValue(() => 1 - zoomProgress.get());

  const lastPointX = useDerivedValue(() =>
    indexToX(candleCount - 1, candleStep.get()),
  );
  const livePriceY = useDerivedValue(() =>
    priceToY(chartPrice.get(), minPrice.get(), maxPrice.get(), PLOT_HEIGHT),
  );
  const tagPrice = useDerivedValue(() =>
    interpolate(
      scrubProgress.get(),
      [0, 1],
      [livePrice.get(), scrubPrice.get()],
    ),
  );
  const tagY = useDerivedValue(() =>
    priceToY(
      interpolate(
        scrubProgress.get(),
        [0, 1],
        [chartPrice.get(), scrubPrice.get()],
      ),
      minPrice.get(),
      maxPrice.get(),
      PLOT_HEIGHT,
    ),
  );
  const baseColor = useDerivedValue(() =>
    interpolateColor(
      zoomProgress.get(),
      [0, 1],
      [previousPriceColor, priceColor],
    ),
  );
  const tagColor = useDerivedValue(() => {
    const candle = candleAt(candles, scrubIndex.get(), livePrice.get());
    return interpolateColor(
      scrubProgress.get(),
      [0, 1],
      [
        baseColor.get(),
        candle.close >= candle.open
          ? colors.priceLineGreen
          : colors.priceLineRed,
      ],
    );
  });
  const priceLineStart = useDerivedValue(() => vec(0, tagY.get()));
  const priceLineEnd = useDerivedValue(() =>
    vec(canvasSize.get().width - AXIS_RIGHT_INSET, tagY.get()),
  );

  const lineOpacity = useDerivedValue(() =>
    interpolate(lineProgress.get(), [0, 0.6], [0, 1], Extrapolation.CLAMP),
  );
  const revealOpacity = useDerivedValue(() =>
    interpolate(drawProgress.get(), [0.6, 1], [0, 1], Extrapolation.CLAMP),
  );
  const axisFadeStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.get(),
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
            />
            <ChartLayer
              paths={paths}
              isUp={isUp}
              opacity={zoomProgress}
              lineProgress={lineProgress}
              lineOpacity={lineOpacity}
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
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}
