import { BlurTargetView } from "expo-blur";
import { useCallback, useRef, useState, type ComponentRef } from "react";
import { View, type ListRenderItem } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CandleChart } from "../components/chart/CandleChart";
import { FeedFilters } from "../components/feed/FeedFilters";
import { TraderCard } from "../components/feed/TraderCard";
import { AssetHeader } from "../components/header/AssetHeader";
import { HeaderFade } from "../components/header/HeaderFade";
import { PriceSection } from "../components/price/PriceSection";
import { TabBar } from "../components/tabs/TabBar";
import { TRADE_BAR_HEIGHT, TradeBar } from "../components/trade/TradeBar";
import { solPerpMarket } from "../data/market";
import { traderPosts } from "../data/traderPosts";
import type { TraderPost } from "../types/traderPost";

const assetTabs = ["Feed", "Holders", "About"];

const keyExtractor = (post: TraderPost) => post.id;

function CardSeparator() {
  return <View className="h-2" />;
}

export function AssetDetailScreen() {
  const market = solPerpMarket;
  const insets = useSafeAreaInsets();
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null);
  const scrollY = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isFollowingOnly, setIsFollowingOnly] = useState(true);
  const [posts, setPosts] = useState(traderPosts);

  // Only the tapped post gets a new object, so only its memoized card re-renders.
  const handleLikePress = useCallback((postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.likes + (post.isLiked ? -1 : 1),
            }
          : post,
      ),
    );
  }, []);

  const renderPost: ListRenderItem<TraderPost> = useCallback(
    ({ item }) => (
      <View className="px-4">
        <TraderCard post={item} onLikePress={handleLikePress} />
      </View>
    ),
    [handleLikePress],
  );

  const handleBack = () => {};

  const handleShare = () => {};

  const handleNotify = () => {};

  const handleSortPress = () => {};

  const handleGoLong = () => {};

  const handleGoShort = () => {};

  return (
    <View className="flex-1 bg-background">
      <View className="pb-3">
        <AssetHeader
          symbol={market.symbol}
          assetName={market.assetName}
          assetIcon={market.assetIcon}
          exchangeIcon={market.exchangeIcon}
          onBack={handleBack}
          onShare={handleShare}
          onNotify={handleNotify}
        />
      </View>

      <View className="flex-1">
        <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
          <Animated.FlatList
            contentContainerStyle={{
              paddingBottom: insets.bottom + TRADE_BAR_HEIGHT,
            }}
            data={posts}
            keyExtractor={keyExtractor}
            renderItem={renderPost}
            ItemSeparatorComponent={CardSeparator}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <View className="gap-6 pb-4 pt-3">
                <PriceSection
                  price={market.price}
                  openPrice={market.openPrice}
                  timeframe={market.timeframe}
                  metrics={market.metrics}
                  initialMetric={market.initialMetric}
                />
                <CandleChart />
                <View className="gap-4">
                  <TabBar
                    tabs={assetTabs}
                    activeIndex={activeTabIndex}
                    onChange={setActiveTabIndex}
                  />
                  <FeedFilters
                    isFollowingOnly={isFollowingOnly}
                    onFollowingOnlyChange={setIsFollowingOnly}
                    onSortPress={handleSortPress}
                  />
                </View>
              </View>
            }
          />
        </BlurTargetView>
        <HeaderFade blurTarget={blurTargetRef} scrollY={scrollY} />
      </View>

      <TradeBar
        blurTarget={blurTargetRef}
        onGoLong={handleGoLong}
        onGoShort={handleGoShort}
      />
    </View>
  );
}
