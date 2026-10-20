import {
  Canvas,
  DashPathEffect,
  Line,
  Path,
  Skia,
  vec,
} from "@shopify/react-native-skia";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { colors } from "../../theme/colors";
import type { Candle, ChartType, Timeframe } from "../../types/candle";
import { getPriceRange, indexToX, priceToY } from "../../utils/chartMath";
import { formatUsd } from "../../utils/format";
import { PriceAxis } from "./PriceAxis";

const PLOT_HEIGHT = 176;
const AXIS_WIDTH = 70;
const AXIS_RIGHT_INSET = 12;
const CANDLE_GAP = 1.5;
const WICK_WIDTH = 1;
const LINE_WIDTH = 2;

type CandleChartProps = {
  candles: Candle[];
  timeframe: Timeframe;
  chartType: ChartType;
};

export const CandleChart = memo(function CandleChart({
  candles,
  timeframe,
  chartType,
}: CandleChartProps) {
  const canvasSize = useSharedValue({ width: 0, height: 0 });
  const { minPrice, maxPrice, step } = getPriceRange(candles);
  const lastClose = candles[candles.length - 1].close;
  const isUp = lastClose >= candles[0].open;
  const priceColor = isUp ? colors.priceLineGreen : colors.priceLineRed;
  const lastCloseY = priceToY(lastClose, minPrice, maxPrice, PLOT_HEIGHT);

  const paths = useDerivedValue(() => {
    const candleStep = (canvasSize.value.width - AXIS_WIDTH) / candles.length;
    const bodyWidth = candleStep - CANDLE_GAP;

    const greenCandles = Skia.PathBuilder.Make();
    const redCandles = Skia.PathBuilder.Make();
    const closeLine = Skia.PathBuilder.Make();

    candles.forEach((candle, index) => {
      const path = candle.close >= candle.open ? greenCandles : redCandles;
      const x = indexToX(index, candleStep);
      const openY = priceToY(candle.open, minPrice, maxPrice, PLOT_HEIGHT);
      const closeY = priceToY(candle.close, minPrice, maxPrice, PLOT_HEIGHT);
      const highY = priceToY(candle.high, minPrice, maxPrice, PLOT_HEIGHT);
      const lowY = priceToY(candle.low, minPrice, maxPrice, PLOT_HEIGHT);

      path.addRect({
        x: x - bodyWidth / 2,
        y: Math.min(openY, closeY),
        width: bodyWidth,
        height: Math.max(1, Math.abs(closeY - openY)),
      });
      path.addRect({
        x: x - WICK_WIDTH / 2,
        y: highY,
        width: WICK_WIDTH,
        height: lowY - highY,
      });

      if (index === 0) {
        closeLine.moveTo(x, closeY);
      } else {
        closeLine.lineTo(x, closeY);
      }
    });

    return {
      greenCandles: greenCandles.detach(),
      redCandles: redCandles.detach(),
      closeLine: closeLine.detach(),
    };
  });

  const greenCandles = useDerivedValue(() => paths.value.greenCandles);
  const redCandles = useDerivedValue(() => paths.value.redCandles);
  const closeLine = useDerivedValue(() => paths.value.closeLine);
  const priceLineEnd = useDerivedValue(() =>
    vec(canvasSize.value.width - AXIS_RIGHT_INSET, lastCloseY),
  );

  return (
    <View
      accessible
      accessibilityLabel={`SOL price chart, ${timeframe}, last ${formatUsd(lastClose)}`}
      className="py-2"
    >
      <View style={{ height: PLOT_HEIGHT }}>
        <Canvas style={StyleSheet.absoluteFill} onSize={canvasSize}>
          {chartType === "candles" ? (
            <>
              <Path path={greenCandles} color={colors.priceLineGreen} />
              <Path path={redCandles} color={colors.priceLineRed} />
            </>
          ) : (
            <Path
              path={closeLine}
              color={priceColor}
              style="stroke"
              strokeWidth={LINE_WIDTH}
              strokeJoin="round"
              strokeCap="round"
            />
          )}
          <Line
            p1={vec(0, lastCloseY)}
            p2={priceLineEnd}
            color={priceColor}
            strokeWidth={1}
            opacity={0.5}
          >
            <DashPathEffect intervals={[4, 4]} />
          </Line>
        </Canvas>

        <PriceAxis
          minPrice={minPrice}
          maxPrice={maxPrice}
          step={step}
          lastClose={lastClose}
          lastCloseY={lastCloseY}
          isUp={isUp}
          height={PLOT_HEIGHT}
        />
      </View>
    </View>
  );
});
