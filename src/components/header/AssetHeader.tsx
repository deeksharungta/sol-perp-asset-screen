import { Image, Text, View, type ImageSourcePropType } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackIcon } from "../icons/BackIcon";
import { BellIcon } from "../icons/BellIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { IconButton } from "../ui/IconButton";

type AssetHeaderProps = {
  symbol: string;
  assetName: string;
  assetIcon: ImageSourcePropType;
  exchangeIcon: ImageSourcePropType;
  onBack: () => void;
  onShare: () => void;
  onNotify: () => void;
};

export function AssetHeader({
  symbol,
  assetName,
  assetIcon,
  exchangeIcon,
  onBack,
  onShare,
  onNotify,
}: AssetHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center gap-3">
        <IconButton
          icon={<BackIcon />}
          onPress={onBack}
          accessibilityLabel="Go back"
        />

        <View>
          <Image source={assetIcon} className="h-9 w-9 rounded-full" />
          <Image
            source={exchangeIcon}
            className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border border-surface"
          />
        </View>

        <View>
          <Text
            accessibilityRole="header"
            className="font-sans text-base font-semibold leading-5 text-text-primary"
          >
            {symbol}
          </Text>
          <Text className="font-sans text-xs font-semibold leading-4 text-text-secondary">
            {assetName}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <IconButton
          icon={<ShareIcon />}
          onPress={onShare}
          accessibilityLabel="Share"
        />
        <IconButton
          icon={<BellIcon />}
          onPress={onNotify}
          accessibilityLabel="Notifications"
        />
      </View>
    </View>
  );
}
