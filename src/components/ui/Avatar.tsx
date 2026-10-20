import { Image, View, type ImageSourcePropType } from "react-native";

import { VerifiedBadgeIcon } from "../icons/VerifiedBadgeIcon";

const sizeClassNames = {
  small: "h-6 w-6",
  medium: "h-8 w-8",
  large: "h-9 w-9",
};

type AvatarProps = {
  source: ImageSourcePropType;
  size?: keyof typeof sizeClassNames;
  isVerified?: boolean;
};

export function Avatar({ source, size = "large", isVerified }: AvatarProps) {
  return (
    <View className="self-start">
      <Image
        source={source}
        className={`rounded-full border border-black/10 ${sizeClassNames[size]}`}
      />
      {isVerified && (
        <View className="absolute -bottom-0.5 -right-0.5">
          <VerifiedBadgeIcon />
        </View>
      )}
    </View>
  );
}
