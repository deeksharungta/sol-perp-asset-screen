import { Image, View, type ImageSourcePropType } from "react-native";

import { VerifiedBadgeIcon } from "../icons/VerifiedBadgeIcon";

type AvatarProps = {
  source: ImageSourcePropType;
  isVerified?: boolean;
};

export function Avatar({ source, isVerified }: AvatarProps) {
  return (
    <View className="self-start">
      <Image
        source={source}
        className="h-9 w-9 rounded-full border border-divider"
      />
      {isVerified && (
        <View className="absolute -bottom-0.5 -right-0.5">
          <VerifiedBadgeIcon />
        </View>
      )}
    </View>
  );
}
