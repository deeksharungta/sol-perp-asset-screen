import { Fragment } from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { holders } from "../../data/holders";
import { fadeInEntering } from "../../theme/animations";
import { surfaces } from "../../theme/surfaces";
import type { Holder } from "../../types/holder";
import { formatSignedUsd, formatUsd } from "../../utils/format";
import { Avatar } from "../ui/Avatar";
import { Divider } from "../ui/Divider";
import { SideLabel } from "../ui/SideLabel";

export function HoldersSection() {
  return (
    <Animated.View
      entering={fadeInEntering}
      className="rounded-3xl bg-surface px-4"
      style={surfaces.card}
    >
      {holders.map((holder, index) => (
        <Fragment key={holder.id}>
          {index > 0 && <Divider />}
          <HolderRow holder={holder} rank={index + 1} />
        </Fragment>
      ))}
    </Animated.View>
  );
}

type HolderRowProps = {
  holder: Holder;
  rank: number;
};

function HolderRow({ holder, rank }: HolderRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <Text className="w-4 font-sans text-xs font-semibold tabular-nums leading-4 text-text-tertiary">
        {rank}
      </Text>
      <Avatar source={holder.avatar} isVerified={holder.isVerified} />
      <View className="flex-1 gap-0.5">
        <Text className="font-sans text-base font-semibold leading-5 text-text-primary">
          {holder.name}
        </Text>
        <SideLabel side={holder.side} leverage={holder.leverage} />
      </View>
      <View className="items-end gap-0.5">
        <Text className="font-sans text-base font-semibold tabular-nums leading-5 text-text-primary">
          {formatUsd(holder.size)}
        </Text>
        <Text
          className={`font-sans text-xs font-semibold tabular-nums leading-4 ${holder.pnl < 0 ? "text-text-red" : "text-text-green"}`}
        >
          {formatSignedUsd(holder.pnl)}
        </Text>
      </View>
    </View>
  );
}
