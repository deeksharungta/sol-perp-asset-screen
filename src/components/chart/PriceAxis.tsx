import { View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { typography } from "../../theme/typography";
import {
  clamp,
  PLOT_HEIGHT,
  priceToY,
  type PriceRange,
} from "../../utils/chartMath";
import { formatPrice } from "../../utils/format";
import { AnimatedText } from "../ui/AnimatedText";

export const AXIS_RIGHT_INSET = 12;
const LABEL_HEIGHT = 13;
const TAG_WIDTH = 52;
const TAG_HEIGHT = 16;
const EDGE_ROOM = 8;

type PriceAxisProps = {
  range: PriceRange;
  previousRange: PriceRange;
  zoomProgress: SharedValue<number>;
  tagY: SharedValue<number>;
  tagPrice: SharedValue<number>;
  tagColor: SharedValue<string>;
};

export function PriceAxis({
  range,
  previousRange,
  zoomProgress,
  tagY,
  tagPrice,
  tagColor,
}: PriceAxisProps) {
  const tagText = useDerivedValue(() => formatPrice(tagPrice.value));
  const tagTop = useDerivedValue(() =>
    clamp(
      tagY.value - TAG_HEIGHT / 2,
      -EDGE_ROOM,
      PLOT_HEIGHT + EDGE_ROOM - TAG_HEIGHT,
    ),
  );
  const tagStyle = useAnimatedStyle(() => ({
    backgroundColor: tagColor.value,
    transform: [{ translateY: tagTop.value }],
  }));
  const previousLabelsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      zoomProgress.value,
      [0, 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const labelsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      zoomProgress.value,
      [0.5, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View className="pointer-events-none absolute inset-0">
      <Animated.View className="absolute inset-0" style={previousLabelsStyle}>
        <PriceLabels range={previousRange} tagTop={tagTop} />
      </Animated.View>
      <Animated.View className="absolute inset-0" style={labelsStyle}>
        <PriceLabels range={range} tagTop={tagTop} />
      </Animated.View>

      <Animated.View
        className="absolute top-0 justify-center rounded-full"
        style={[
          { right: AXIS_RIGHT_INSET, width: TAG_WIDTH, height: TAG_HEIGHT },
          tagStyle,
        ]}
      >
        <AnimatedText
          text={tagText}
          className="text-center font-sans text-2xs font-bold text-text-on-color"
          style={typography.animatedText2xs}
        />
      </Animated.View>
    </View>
  );
}

type PriceLabelsProps = {
  range: PriceRange;
  tagTop: SharedValue<number>;
};

function PriceLabels({
  range: { minPrice, maxPrice, step },
  tagTop,
}: PriceLabelsProps) {
  const labelCount = Math.round((maxPrice - minPrice) / step) + 1;
  const labelPrices = Array.from(
    { length: labelCount },
    (_, index) => minPrice + index * step,
  );

  return labelPrices.map((price) => (
    <PriceLabel
      key={price}
      text={`$${price.toFixed(step >= 1 ? 0 : 2)}`}
      y={priceToY(price, minPrice, maxPrice, PLOT_HEIGHT)}
      tagTop={tagTop}
    />
  ));
}

type PriceLabelProps = {
  text: string;
  y: number;
  tagTop: SharedValue<number>;
};

function PriceLabel({ text, y, tagTop }: PriceLabelProps) {
  const hideStyle = useAnimatedStyle(() => {
    const tagCenterY = tagTop.value + TAG_HEIGHT / 2;
    const isCovered =
      Math.abs(y - tagCenterY) < (LABEL_HEIGHT + TAG_HEIGHT) / 2;
    return { opacity: isCovered ? 0 : 1 };
  });

  return (
    <Animated.Text
      className="absolute right-5 font-sans text-2xs font-bold text-text-secondary"
      style={[typography.tabularNums, { top: y - LABEL_HEIGHT / 2 }, hideStyle]}
    >
      {text}
    </Animated.Text>
  );
}
