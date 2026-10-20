import { StyleSheet } from "react-native";

import { colors } from "./colors";

const glassShadow = `inset 0 -6px 12px 0 ${colors.glassInnerHighlight}, 0 2px 12px 0 ${colors.glassDropShadow}`;

export const surfaces = StyleSheet.create({
  glass: {
    backgroundImage: `linear-gradient(to bottom, ${colors.glassFillStart}, ${colors.glassFillEnd})`,
    boxShadow: glassShadow,
  },
  pill: {
    backgroundImage: `linear-gradient(to bottom, ${colors.pillFillStart}, ${colors.pillFillEnd})`,
    boxShadow: glassShadow,
  },
  card: {
    boxShadow: `0 1px 0 0 ${colors.surface}`,
  },
});
