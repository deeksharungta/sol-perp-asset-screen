import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from "react-native-reanimated";

import { clamp, priceToY } from "../../utils/chartMath";
import { formatPrice } from "../../utils/format";
import { AnimatedText } from "../ui/AnimatedText";

const LABEL_HEIGHT = 13;
const TAG_WIDTH = 46;
const TAG_HEIGHT = 16;
const EDGE_ROOM = 8;

type PriceAxisProps = {
  minPrice: number;
  maxPrice: number;
  step: number;
  lastCloseY: number;
  tagPrice: SharedValue<number>;
  isUp: boolean;
  height: number;
};

export function PriceAxis({
  minPrice,
  maxPrice,
  step,
  lastCloseY,
  tagPrice,
  isUp,
  height,
}: PriceAxisProps) {
  const labelCount = Math.round((maxPrice - minPrice) / step) + 1;
  const labelPrices = Array.from(
    { length: labelCount },
    (_, index) => minPrice + index * step,
  );

  const tagTop = clamp(
    lastCloseY - TAG_HEIGHT / 2,
    -EDGE_ROOM,
    height + EDGE_ROOM - TAG_HEIGHT,
  );
  const tagCenterY = tagTop + TAG_HEIGHT / 2;

  const tagText = useDerivedValue(() => formatPrice(tagPrice.value));
  const tagStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: clamp(
          priceToY(tagPrice.value, minPrice, maxPrice, height) - TAG_HEIGHT / 2,
          -EDGE_ROOM,
          height + EDGE_ROOM - TAG_HEIGHT,
        ),
      },
    ],
  }));

  return (
    <View className="pointer-events-none absolute inset-0">
      {labelPrices.map((price) => {
        const y = priceToY(price, minPrice, maxPrice, height);
        if (Math.abs(y - tagCenterY) < (LABEL_HEIGHT + TAG_HEIGHT) / 2) {
          return null;
        }
        return (
          <Text
            key={price}
            className="absolute right-5 font-sans text-2xs font-bold tabular-nums text-text-secondary"
            style={{ top: y - LABEL_HEIGHT / 2 }}
          >
            ${price.toFixed(step >= 1 ? 0 : 2)}
          </Text>
        );
      })}

      <Animated.View
        className={`absolute right-3 top-0 h-4 justify-center rounded-full ${isUp ? "bg-price-line-green" : "bg-price-line-red"}`}
        style={[{ width: TAG_WIDTH }, tagStyle]}
      >
        <AnimatedText
          text={tagText}
          className="text-center font-sans text-2xs font-bold text-text-on-color"
        />
      </Animated.View>
    </View>
  );
}
