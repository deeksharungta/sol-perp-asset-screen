import {
  Canvas,
  Circle,
  DashPathEffect,
  Group,
  Line,
  LinearGradient,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { memo, useEffect } from "react";
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
import { chartMorphTiming, drawInTiming } from "../../theme/animations";
import { colors } from "../../theme/colors";
import type { Candle, ChartType, Timeframe } from "../../types/candle";
import {
  buildChartPaths,
  getPriceRange,
  indexToX,
  priceToY,
} from "../../utils/chartMath";
import { formatUsd } from "../../utils/format";
import { PriceAxis } from "./PriceAxis";

const PLOT_HEIGHT = 176;
const AXIS_WIDTH = 70;
const AXIS_RIGHT_INSET = 12;
const LINE_WIDTH = 2;
const AREA_OPACITY = 0.24;
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
  const { minPrice, maxPrice, step } = getPriceRange(candles);
  const candleCount = candles.length;
  const lastClose = candles[candleCount - 1].close;
  const isUp = lastClose >= candles[0].open;
  const priceColor = isUp ? colors.priceLineGreen : colors.priceLineRed;
  const priceFadeColor = isUp
    ? colors.priceLineGreenTransparent
    : colors.priceLineRedTransparent;
  const lastCloseY = priceToY(lastClose, minPrice, maxPrice, PLOT_HEIGHT);

  const lineProgress = useSharedValue(chartType === "line" ? 1 : 0);
  const livePulse = useLivePulse(chartType);

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

  const { scrubGesture, scrubX, scrubPrice } = useChartScrub({
    candles,
    candleStep,
    plotWidth,
    scrubIndex,
    scrubProgress,
  });

  const paths = useDerivedValue(() =>
    buildChartPaths(
      candles,
      livePrice.value,
      {
        candleStep: candleStep.value,
        plotHeight: PLOT_HEIGHT,
        minPrice,
        maxPrice,
      },
      { draw: drawProgress.value, line: lineProgress.value },
    ),
  );

  const greenCandles = useDerivedValue(() => paths.value.greenCandles);
  const redCandles = useDerivedValue(() => paths.value.redCandles);
  const closeLine = useDerivedValue(() => paths.value.closeLine);
  const closeArea = useDerivedValue(() => paths.value.closeArea);
  const lastPointX = useDerivedValue(() =>
    indexToX(candleCount - 1, candleStep.value),
  );
  const livePriceY = useDerivedValue(() =>
    priceToY(livePrice.value, minPrice, maxPrice, PLOT_HEIGHT),
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
    priceToY(tagPrice.value, minPrice, maxPrice, PLOT_HEIGHT),
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

  const greenCandleColor = useDerivedValue(() =>
    interpolateColor(
      lineProgress.value,
      [0, 1],
      [colors.priceLineGreen, priceColor],
    ),
  );
  const redCandleColor = useDerivedValue(() =>
    interpolateColor(
      lineProgress.value,
      [0, 1],
      [colors.priceLineRed, priceColor],
    ),
  );
  const candlesOpacity = useDerivedValue(() =>
    interpolate(lineProgress.value, [0.7, 1], [1, 0], Extrapolation.CLAMP),
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
            <Group opacity={candlesOpacity}>
              <Path path={greenCandles} color={greenCandleColor} />
              <Path path={redCandles} color={redCandleColor} />
            </Group>
            <Group opacity={lineOpacity}>
              <Group opacity={axisOpacity}>
                <Path path={closeArea} opacity={AREA_OPACITY}>
                  <LinearGradient
                    start={vec(0, 0)}
                    end={vec(0, PLOT_HEIGHT)}
                    colors={[priceColor, priceFadeColor]}
                  />
                </Path>
              </Group>
              <Path
                path={closeLine}
                color={priceColor}
                style="stroke"
                strokeWidth={LINE_WIDTH}
                strokeJoin="round"
                strokeCap="round"
                end={drawProgress}
              />
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
              minPrice={minPrice}
              maxPrice={maxPrice}
              step={step}
              tagPrice={tagPrice}
              lastCloseY={lastCloseY}
              tagColor={tagColor}
              height={PLOT_HEIGHT}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
});
