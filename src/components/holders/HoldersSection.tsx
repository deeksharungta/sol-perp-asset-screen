import { Fragment } from "react";
import { Text, View } from "react-native";

import { holders } from "../../data/holders";
import { fadeInEntering } from "../../theme/animations";
import { typography } from "../../theme/typography";
import type { Holder } from "../../types/holder";
import { AmountWithPnl } from "../ui/AmountWithPnl";
import { Avatar } from "../ui/Avatar";
import { Card } from "../ui/Card";
import { Divider } from "../ui/Divider";
import { SideLabel } from "../ui/SideLabel";

export function HoldersSection() {
  return (
    <Card entering={fadeInEntering} className="px-4">
      {holders.map((holder, index) => (
        <Fragment key={holder.id}>
          {index > 0 && <Divider />}
          <HolderRow holder={holder} rank={index + 1} />
        </Fragment>
      ))}
    </Card>
  );
}

type HolderRowProps = {
  holder: Holder;
  rank: number;
};

function HolderRow({ holder, rank }: HolderRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <Text
        style={typography.tabularNums}
        className="w-4 font-sans text-xs font-semibold leading-4 text-text-tertiary"
      >
        {rank}
      </Text>
      <Avatar source={holder.avatar} isVerified={holder.isVerified} />
      <View className="flex-1 gap-0.5">
        <Text
          numberOfLines={1}
          className="font-sans text-base font-semibold leading-5 text-text-primary"
        >
          {holder.name}
        </Text>
        <SideLabel side={holder.side} leverage={holder.leverage} />
      </View>
      <AmountWithPnl amount={holder.size} pnl={holder.pnl} />
    </View>
  );
}
