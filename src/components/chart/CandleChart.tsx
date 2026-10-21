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
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import {
  drawInTiming,
  scrubFadeTiming,
  slideTiming,
} from "../../theme/animations";
import { colors } from "../../theme/colors";
import type { Candle, ChartType, Timeframe } from "../../types/candle";
import {
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
const END_HALO_RADIUS = 7;
const DASH_INTERVALS = [4, 4];
const DRAW_IN_SPREAD = 10;
const SCRUB_ACTIVATION_DISTANCE = 8;
const SCRUB_HOLD_DURATION = 150;

type CandleChartProps = {
  candles: Candle[];
  timeframe: Timeframe;
  chartType: ChartType;
  scrubIndex: SharedValue<number>;
  scrubProgress: SharedValue<number>;
  drawProgress: SharedValue<number>;
};

export const CandleChart = memo(function CandleChart({
  candles,
  timeframe,
  chartType,
  scrubIndex,
  scrubProgress,
  drawProgress,
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

  useEffect(() => {
    drawProgress.value = withTiming(1, drawInTiming);
  }, [candles, drawProgress]);

  useEffect(() => {
    lineProgress.value = withTiming(chartType === "line" ? 1 : 0, slideTiming);
  }, [chartType, lineProgress]);

  const candleStep = useDerivedValue(
    () => (canvasSize.value.width - AXIS_WIDTH) / candleCount,
  );

  const scrubGesture = usePanGesture({
    activeOffsetX: [-SCRUB_ACTIVATION_DISTANCE, SCRUB_ACTIVATION_DISTANCE],
    failOffsetY: [-SCRUB_ACTIVATION_DISTANCE, SCRUB_ACTIVATION_DISTANCE],
    activateAfterLongPress: SCRUB_HOLD_DURATION,
    onActivate: (event) => {
      scrubIndex.value = xToIndex(event.x, candleStep.value, candleCount);
      scrubProgress.value = withTiming(1, scrubFadeTiming);
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    },
    onUpdate: (event) => {
      const index = xToIndex(event.x, candleStep.value, candleCount);
      if (index !== scrubIndex.value) {
        scrubIndex.value = index;
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
    const closeLine = Skia.PathBuilder.Make();

    candles.forEach((candle, index) => {
      const x = indexToX(index, candleStep.value);
      const closeY = priceToY(candle.close, minPrice, maxPrice, PLOT_HEIGHT);

      if (index === 0) {
        closeLine.moveTo(x, closeY);
      } else {
        closeLine.lineTo(x, closeY);
      }

      const reveal =
        clamp(
          drawProgress.value * (candleCount + DRAW_IN_SPREAD) - index,
          0,
          DRAW_IN_SPREAD,
        ) / DRAW_IN_SPREAD;
      if (reveal === 0) {
        return;
      }

      const highY = priceToY(candle.high, minPrice, maxPrice, PLOT_HEIGHT);
      const lowY = priceToY(candle.low, minPrice, maxPrice, PLOT_HEIGHT);
      const middleY = (highY + lowY) / 2;
      const grow = (y: number) => middleY + (y - middleY) * reveal;
      const openY = priceToY(candle.open, minPrice, maxPrice, PLOT_HEIGHT);

      const path = candle.close >= candle.open ? greenCandles : redCandles;
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
  const priceLineEnd = useDerivedValue(() =>
    vec(canvasSize.value.width - AXIS_RIGHT_INSET, lastCloseY),
  );

  const candlesOpacity = useDerivedValue(() => 1 - lineProgress.value);
  const axisOpacity = useDerivedValue(() =>
    interpolate(drawProgress.value, [0.6, 1], [0, 1], Extrapolation.CLAMP),
  );
  const axisFadeStyle = useAnimatedStyle(() => ({
    opacity: axisOpacity.value,
  }));

  const crosshairX = useDerivedValue(() =>
    indexToX(scrubIndex.value, candleStep.value),
  );
  const crosshair = useDerivedValue(() =>
    Skia.PathBuilder.Make()
      .moveTo(crosshairX.value, 0)
      .lineTo(crosshairX.value, PLOT_HEIGHT)
      .detach(),
  );
  // Covers everything except the selected candle's slot.
  const dimmedArea = useDerivedValue(() => {
    const slotLeft = crosshairX.value - candleStep.value / 2;
    const slotRight = crosshairX.value + candleStep.value / 2;
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
              <Path path={greenCandles} color={colors.priceLineGreen} />
              <Path path={redCandles} color={colors.priceLineRed} />
            </Group>
            <Group opacity={lineProgress}>
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
                  cy={lastCloseY}
                  r={END_HALO_RADIUS}
                  color={priceColor}
                  opacity={AREA_OPACITY}
                />
                <Circle
                  cx={lastPointX}
                  cy={lastCloseY}
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
                p1={vec(0, lastCloseY)}
                p2={priceLineEnd}
                color={priceColor}
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
              lastClose={lastClose}
              lastCloseY={lastCloseY}
              isUp={isUp}
              height={PLOT_HEIGHT}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
});
