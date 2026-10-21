import { Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { typography } from "../../theme/typography";
import { clamp, priceToY, type PriceRange } from "../../utils/chartMath";
import { formatPrice } from "../../utils/format";
import { AnimatedText } from "../ui/AnimatedText";

const LABEL_HEIGHT = 13;
const TAG_WIDTH = 52;
const TAG_HEIGHT = 16;
const EDGE_ROOM = 8;

function getTagTop(
  price: number,
  minPrice: number,
  maxPrice: number,
  height: number,
) {
  "worklet";
  return clamp(
    priceToY(price, minPrice, maxPrice, height) - TAG_HEIGHT / 2,
    -EDGE_ROOM,
    height + EDGE_ROOM - TAG_HEIGHT,
  );
}

type PriceAxisProps = {
  range: PriceRange;
  previousRange: PriceRange;
  zoomProgress: SharedValue<number>;
  minPrice: SharedValue<number>;
  maxPrice: SharedValue<number>;
  lastClose: number;
  tagPrice: SharedValue<number>;
  tagColor: SharedValue<string>;
  height: number;
};

export function PriceAxis({
  range,
  previousRange,
  zoomProgress,
  minPrice,
  maxPrice,
  lastClose,
  tagPrice,
  tagColor,
  height,
}: PriceAxisProps) {
  const tagText = useDerivedValue(() => formatPrice(tagPrice.value));
  const tagStyle = useAnimatedStyle(() => ({
    backgroundColor: tagColor.value,
    transform: [
      {
        translateY: getTagTop(
          tagPrice.value,
          minPrice.value,
          maxPrice.value,
          height,
        ),
      },
    ],
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
        <PriceLabels
          range={previousRange}
          lastClose={lastClose}
          height={height}
        />
      </Animated.View>
      <Animated.View className="absolute inset-0" style={labelsStyle}>
        <PriceLabels range={range} lastClose={lastClose} height={height} />
      </Animated.View>

      <Animated.View
        className="absolute right-3 top-0 h-4 justify-center rounded-full"
        style={[{ width: TAG_WIDTH }, tagStyle]}
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
  lastClose: number;
  height: number;
};

function PriceLabels({
  range: { minPrice, maxPrice, step },
  lastClose,
  height,
}: PriceLabelsProps) {
  const labelCount = Math.round((maxPrice - minPrice) / step) + 1;
  const labelPrices = Array.from(
    { length: labelCount },
    (_, index) => minPrice + index * step,
  );
  const tagCenterY =
    getTagTop(lastClose, minPrice, maxPrice, height) + TAG_HEIGHT / 2;

  return labelPrices.map((price) => {
    const y = priceToY(price, minPrice, maxPrice, height);
    if (Math.abs(y - tagCenterY) < (LABEL_HEIGHT + TAG_HEIGHT) / 2) {
      return null;
    }
    return (
      <Text
        key={price}
        className="absolute right-5 font-sans text-2xs font-bold text-text-secondary"
        style={[typography.tabularNums, { top: y - LABEL_HEIGHT / 2 }]}
      >
        ${price.toFixed(step >= 1 ? 0 : 2)}
      </Text>
    );
  });
}
