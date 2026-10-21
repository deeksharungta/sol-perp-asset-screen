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
import * as Haptics from "expo-haptics";
import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  chartMorphTiming,
  drawInTiming,
  livePulseTiming,
  scrubFadeTiming,
  scrubGlideTiming,
} from "../../theme/animations";
import { colors } from "../../theme/colors";
import type { Candle, ChartType, Timeframe } from "../../types/candle";
import {
  addSmoothLine,
  clamp,
  getPriceRange,
  indexToX,
  priceToY,
  xToIndex,
} from "../../utils/chartMath";
import { formatUsd } from "../../utils/format";
import { PriceAxis } from "./PriceAxis";

const PLOT_HEIGHT = 176;
const AXIS_WIDTH = 70;
const AXIS_RIGHT_INSET = 12;
const CANDLE_GAP = 1.5;
const WICK_WIDTH = 1;
const LINE_WIDTH = 2;
const AREA_OPACITY = 0.24;
const END_DOT_RADIUS = 3;
const LIVE_PULSE_RADIUS = 14;
const LIVE_PULSE_OPACITY = 0.3;
const DASH_INTERVALS = [4, 4];
const DRAW_IN_SPREAD = 10;
const SCRUB_ACTIVATION_DISTANCE = 8;

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
  const livePulse = useSharedValue(0);
  const scrubX = useSharedValue(0);
  const scrubPrice = useSharedValue(lastClose);

  useEffect(() => {
    drawProgress.value = withTiming(1, drawInTiming);
  }, [candles, drawProgress]);

  useEffect(() => {
    lineProgress.value = withTiming(
      chartType === "line" ? 1 : 0,
      chartMorphTiming,
    );
  }, [chartType, lineProgress]);

  useEffect(() => {
    livePulse.value =
      chartType === "line" ? withRepeat(withTiming(1, livePulseTiming), -1) : 0;
  }, [chartType, livePulse]);

  const candleStep = useDerivedValue(
    () => (canvasSize.value.width - AXIS_WIDTH) / candleCount,
  );

  const scrubGesture = usePanGesture({
    activeOffsetX: [-SCRUB_ACTIVATION_DISTANCE, SCRUB_ACTIVATION_DISTANCE],
    failOffsetY: [-SCRUB_ACTIVATION_DISTANCE, SCRUB_ACTIVATION_DISTANCE],
    onActivate: (event) => {
      const index = xToIndex(event.x, candleStep.value, candleCount);
      scrubX.value = clamp(event.x, 0, canvasSize.value.width - AXIS_WIDTH);
      scrubIndex.value = index;
      scrubPrice.value = candles[index].close;
      scrubProgress.value = withTiming(1, scrubFadeTiming);
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    },
    onUpdate: (event) => {
      scrubX.value = clamp(event.x, 0, canvasSize.value.width - AXIS_WIDTH);
      const index = xToIndex(event.x, candleStep.value, candleCount);
      if (index !== scrubIndex.value) {
        scrubIndex.value = index;
        scrubPrice.value = withTiming(candles[index].close, scrubGlideTiming);
        scheduleOnRN(Haptics.selectionAsync);
      }
    },
    onDeactivate: () => {
      scrubProgress.value = withTiming(0, scrubFadeTiming);
    },
  });

  const paths = useDerivedValue(() => {
    const bodyWidth = candleStep.value - CANDLE_GAP;

    const greenCandles = Skia.PathBuilder.Make();
    const redCandles = Skia.PathBuilder.Make();
    const closePoints: { x: number; y: number }[] = [];

    candles.forEach((candle, index) => {
      const x = indexToX(index, candleStep.value);
      const isLiveCandle = index === candleCount - 1;
      const close = isLiveCandle ? livePrice.value : candle.close;
      const high = isLiveCandle ? Math.max(candle.high, close) : candle.high;
      const low = isLiveCandle ? Math.min(candle.low, close) : candle.low;
      const closeY = priceToY(close, minPrice, maxPrice, PLOT_HEIGHT);
      closePoints.push({ x, y: closeY });

      const reveal =
        clamp(
          drawProgress.value * (candleCount + DRAW_IN_SPREAD) - index,
          0,
          DRAW_IN_SPREAD,
        ) / DRAW_IN_SPREAD;
      if (reveal === 0) {
        return;
      }

      const collapse = (y: number) => y + (closeY - y) * lineProgress.value;
      const highY = collapse(priceToY(high, minPrice, maxPrice, PLOT_HEIGHT));
      const lowY = collapse(priceToY(low, minPrice, maxPrice, PLOT_HEIGHT));
      const middleY = (highY + lowY) / 2;
      const grow = (y: number) => middleY + (y - middleY) * reveal;
      const openY = collapse(
        priceToY(candle.open, minPrice, maxPrice, PLOT_HEIGHT),
      );

      const path = close >= candle.open ? greenCandles : redCandles;
      path.addRect({
        x: x - bodyWidth / 2,
        y: grow(Math.min(openY, closeY)),
        width: bodyWidth,
        height: Math.max(1, Math.abs(closeY - openY) * reveal),
      });
      path.addRect({
        x: x - WICK_WIDTH / 2,
        y: grow(highY),
        width: WICK_WIDTH,
        height: (lowY - highY) * reveal,
      });
    });

    const closeLine = Skia.PathBuilder.Make();
    addSmoothLine(closeLine, closePoints);
    const closeLinePath = closeLine.detach();
    const closeArea = Skia.PathBuilder.MakeFromPath(closeLinePath)
      .lineTo(indexToX(candleCount - 1, candleStep.value), PLOT_HEIGHT)
      .lineTo(indexToX(0, candleStep.value), PLOT_HEIGHT)
      .close()
      .detach();

    return {
      greenCandles: greenCandles.detach(),
      redCandles: redCandles.detach(),
      closeLine: closeLinePath,
      closeArea,
    };
  });

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
    const plotRight = canvasSize.value.width - AXIS_WIDTH;
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
