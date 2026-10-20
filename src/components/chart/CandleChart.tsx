import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { memo } from "react";
import { View } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { candlesByTimeframe } from "../../data/candles";
import { colors } from "../../theme/colors";
import { indexToX, priceToY } from "../../utils/chartMath";

const AXIS_WIDTH = 70;
const CANDLE_GAP = 1.5;
const WICK_WIDTH = 1;
const PRICE_PADDING = 0.08;

export const CandleChart = memo(function CandleChart() {
  const canvasSize = useSharedValue({ width: 0, height: 0 });
  const candles = useSharedValue(candlesByTimeframe["1D"]);

  const paths = useDerivedValue(() => {
    const { width, height } = canvasSize.value;
    const data = candles.value;
    const candleStep = (width - AXIS_WIDTH) / data.length;
    const bodyWidth = candleStep - CANDLE_GAP;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const candle of data) {
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    }
    const padding = (maxPrice - minPrice) * PRICE_PADDING;
    minPrice -= padding;
    maxPrice += padding;

    const greenCandles = Skia.PathBuilder.Make();
    const redCandles = Skia.PathBuilder.Make();

    data.forEach((candle, index) => {
      const path = candle.close >= candle.open ? greenCandles : redCandles;
      const x = indexToX(index, candleStep);
      const openY = priceToY(candle.open, minPrice, maxPrice, height);
      const closeY = priceToY(candle.close, minPrice, maxPrice, height);
      const highY = priceToY(candle.high, minPrice, maxPrice, height);
      const lowY = priceToY(candle.low, minPrice, maxPrice, height);

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
    });

    return {
      greenCandles: greenCandles.detach(),
      redCandles: redCandles.detach(),
    };
  });

  const greenCandles = useDerivedValue(() => paths.value.greenCandles);
  const redCandles = useDerivedValue(() => paths.value.redCandles);

  return (
    <View className="h-48">
      <Canvas style={{ flex: 1 }} onSize={canvasSize}>
        <Path path={greenCandles} color={colors.priceLineGreen} />
        <Path path={redCandles} color={colors.priceLineRed} />
      </Canvas>
    </View>
  );
});
