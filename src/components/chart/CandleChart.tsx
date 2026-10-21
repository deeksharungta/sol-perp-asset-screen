import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Line,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { memo, useEffect, useState } from "react";
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

import { useChartScrub } from "../../hooks/useChartScrub";
import { useLivePulse } from "../../hooks/useLivePulse";
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
} from "../../utils/chartMath";
import { formatUsd } from "../../utils/format";
import { ChartLayer } from "./ChartLayer";
import { PriceAxis } from "./PriceAxis";

const PLOT_HEIGHT = 176;
const AXIS_WIDTH = 70;
const AXIS_RIGHT_INSET = 12;
const END_DOT_RADIUS = 3;
const LIVE_PULSE_RADIUS = 14;
const LIVE_PULSE_OPACITY = 0.3;
const DASH_INTERVALS = [4, 4];

type CandleChartProps = {
  candles: Candle[];
  timeframe: Timeframe;
  chartType: ChartType;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
  drawProgress: SharedValue<number>;
  livePrice: SharedValue<number>;
};

export const CandleChart = memo(function CandleChart({
  candles,
  timeframe,
  chartType,
  scrubIndex,
  scrubProgress,
  drawProgress,
  livePrice,
}: CandleChartProps) {
  const canvasSize = useSharedValue({ width: 0, height: 0 });
  const [layers, setLayers] = useState({
    candles,
    previousCandles: candles,
  });
  if (layers.candles !== candles) {
    setLayers({ candles, previousCandles: layers.candles });
  }
  const { previousCandles } = layers;

  const range = getPriceRange(candles);
  const previousRange = getPriceRange(previousCandles);
  const candleCount = candles.length;
  const lastClose = candles[candleCount - 1].close;
  const isUp = lastClose >= candles[0].open;
  const previousLastClose = previousCandles[candleCount - 1].close;
  const isPreviousUp = previousLastClose >= previousCandles[0].open;
  const logRatio = Math.log(
    (candles[candleCount - 1].time - candles[0].time) /
      (previousCandles[candleCount - 1].time - previousCandles[0].time),
  );
  const priceColor = isUp ? colors.priceLineGreen : colors.priceLineRed;

  const lineProgress = useSharedValue(chartType === "line" ? 1 : 0);
  const zoomProgress = useSharedValue(1);
  const livePulse = useLivePulse(chartType);

  useEffect(() => {
    if (previousCandles === candles) {
      return;
    }
    zoomProgress.value = 0;
    zoomProgress.value = withTiming(1, timeframeZoomTiming);
  }, [candles, previousCandles, zoomProgress]);

  useEffect(() => {
    drawProgress.value = withTiming(1, drawInTiming);
  }, [candles, drawProgress]);

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
  });

  // Snaps the live price to half a pixel, so ticks too small to see don't rebuild the paths.
  const chartPrice = useDerivedValue(() => {
    const step = (0.5 * (maxPrice.value - minPrice.value)) / PLOT_HEIGHT;
    return Math.round(livePrice.value / step) * step;
  });

  const paths = useDerivedValue(() =>
    buildChartPaths(
      candles,
      chartPrice.value,
      {
        candleStep: candleStep.value,
        plotHeight: PLOT_HEIGHT,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        zoom: Math.exp(logRatio * (1 - zoomProgress.value)),
      },
      { draw: drawProgress.value, line: lineProgress.value },
    ),
  );
  const previousPaths = useDerivedValue(() =>
    buildChartPaths(
      zoomProgress.value < 1 ? previousCandles : [],
      previousLastClose,
      {
        candleStep: candleStep.value,
        plotHeight: PLOT_HEIGHT,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        zoom: Math.exp(-logRatio * zoomProgress.value),
      },
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
  const livePulseRadius = useDerivedValue(
    () =>
      END_DOT_RADIUS + (LIVE_PULSE_RADIUS - END_DOT_RADIUS) * livePulse.value,
  );
  const livePulseOpacity = useDerivedValue(
    () => LIVE_PULSE_OPACITY * (1 - livePulse.value),
  );
  const tagPrice = useDerivedValue(() =>
    interpolate(
      scrubProgress.value,
      [0, 1],
      [livePrice.value, scrubPrice.value],
    ),
  );
  const tagY = useDerivedValue(() =>
    priceToY(tagPrice.value, minPrice.value, maxPrice.value, PLOT_HEIGHT),
  );
  const tagColor = useDerivedValue(() => {
    const candle = candles[scrubIndex.value];
    return interpolateColor(
      scrubProgress.value,
      [0, 1],
      [
        priceColor,
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
  const axisOpacity = useDerivedValue(() =>
    interpolate(drawProgress.value, [0.6, 1], [0, 1], Extrapolation.CLAMP),
  );
  const axisFadeStyle = useAnimatedStyle(() => ({
    opacity: axisOpacity.value,
  }));

  const selectedX = useDerivedValue(() =>
    indexToX(scrubIndex.value, candleStep.value),
  );
  const crosshair = useDerivedValue(() =>
    Skia.PathBuilder.Make()
      .moveTo(scrubX.value, 0)
      .lineTo(scrubX.value, PLOT_HEIGHT)
      .detach(),
  );
  // Covers everything except the selected candle's slot.
  const dimmedArea = useDerivedValue(() => {
    const slotLeft = selectedX.value - candleStep.value / 2;
    const slotRight = selectedX.value + candleStep.value / 2;
    const plotRight = plotWidth.value;
    return Skia.PathBuilder.Make()
      .addRect(Skia.XYWHRect(0, 0, slotLeft, PLOT_HEIGHT))
      .addRect(Skia.XYWHRect(slotRight, 0, plotRight - slotRight, PLOT_HEIGHT))
      .detach();
  });

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
              drawProgress={drawProgress}
              axisOpacity={axisOpacity}
              plotHeight={PLOT_HEIGHT}
            />
            <ChartLayer
              paths={paths}
              isUp={isUp}
              opacity={zoomProgress}
              lineProgress={lineProgress}
              drawProgress={drawProgress}
              axisOpacity={axisOpacity}
              plotHeight={PLOT_HEIGHT}
            />
            <Group opacity={lineOpacity}>
              <Group opacity={axisOpacity}>
                <Circle
                  cx={lastPointX}
                  cy={livePriceY}
                  r={livePulseRadius}
                  color={priceColor}
                  opacity={livePulseOpacity}
                />
                <Circle
                  cx={lastPointX}
                  cy={livePriceY}
                  r={END_DOT_RADIUS}
                  color={priceColor}
                />
              </Group>
            </Group>
            <Group opacity={scrubProgress}>
              <Path path={dimmedArea} color={colors.background} opacity={0.5} />
            </Group>
            <Group opacity={axisOpacity}>
              <Line
                p1={priceLineStart}
                p2={priceLineEnd}
                color={tagColor}
                strokeWidth={1}
                opacity={0.5}
              >
                <DashPathEffect intervals={DASH_INTERVALS} />
              </Line>
            </Group>
            <Group opacity={scrubProgress}>
              <Path
                path={crosshair}
                color={colors.textTertiary}
                style="stroke"
                strokeWidth={StyleSheet.hairlineWidth}
              />
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
              minPrice={minPrice}
              maxPrice={maxPrice}
              lastClose={lastClose}
              tagPrice={tagPrice}
              tagColor={tagColor}
              height={PLOT_HEIGHT}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
});
