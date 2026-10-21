import { startTransition, useCallback, useMemo, useRef, useState } from "react";
import { Share, View, type FlatList, type ListRenderItem } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import { AssetOverview } from "../components/AssetOverview";
import { AboutSection } from "../components/about/AboutSection";
import { TraderCard } from "../components/feed/TraderCard";
import { AssetHeader } from "../components/header/AssetHeader";
import { HeaderFade } from "../components/header/HeaderFade";
import { HoldersSection } from "../components/holders/HoldersSection";
import { TradeBar, useTradeBarHeight } from "../components/trade/TradeBar";
import { ScrollToTopButton } from "../components/ui/ScrollToTopButton";
import { Toast } from "../components/ui/Toast";
import { solPerpMarket } from "../data/market";
import { useFeed } from "../hooks/useFeed";
import { useLivePrice } from "../hooks/useLivePrice";
import { useToast } from "../hooks/useToast";
import { feedReorderLayout } from "../theme/animations";
import type { TraderPost } from "../types/traderPost";
import { formatUsd } from "../utils/format";

const assetTabs = ["Feed", "Holders", "About"] as const;

const keyExtractor = (post: TraderPost) => post.id;

export function AssetDetailScreen() {
  const market = solPerpMarket;
  const tradeBarHeight = useTradeBarHeight();
  const livePrice = useLivePrice(market.price);
  const { toastMessage, showToast } = useToast();
  const listRef = useRef<FlatList<TraderPost>>(null);
  const scrollY = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = assetTabs[activeTabIndex];
  const {
    visiblePosts,
    toggleLike,
    isFollowingOnly,
    changeFollowingOnly,
    isLargestFirst,
    toggleSort,
  } = useFeed();

  const renderPost: ListRenderItem<TraderPost> = useCallback(
    ({ item }) => (
      <View className="px-4 pb-2">
        <TraderCard post={item} onLikePress={toggleLike} />
      </View>
    ),
    [toggleLike],
  );

  const handleBack = useCallback(() => {
    showToast("Back navigation is coming soon");
  }, [showToast]);

  const handleShare = useCallback(() => {
    Share.share({
      message: `${market.symbol} is trading at ${formatUsd(market.price)}`,
    });
  }, [market]);

  const handleNotify = useCallback(() => {
    showToast("Price alerts are coming soon");
  }, [showToast]);

  const handleTabChange = useCallback((index: number) => {
    startTransition(() => {
      setActiveTabIndex(index);
    });
  }, []);

  const handleGoLong = useCallback(() => {
    showToast("Long orders are coming soon");
  }, [showToast]);

  const handleGoShort = useCallback(() => {
    showToast("Short orders are coming soon");
  }, [showToast]);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const listContentStyle = useMemo(
    () => ({ paddingBottom: tradeBarHeight }),
    [tradeBarHeight],
  );

  return (
    <View className="flex-1 bg-background">
      <View className="pb-3">
        <AssetHeader
          market={market}
          livePrice={livePrice}
          scrollY={scrollY}
          onTitlePress={handleScrollToTop}
          onBack={handleBack}
          onShare={handleShare}
          onNotify={handleNotify}
        />
      </View>

      <View className="flex-1">
        <View className="flex-1 bg-background">
          <Animated.FlatList
            ref={listRef}
            contentContainerStyle={listContentStyle}
            data={activeTab === "Feed" ? visiblePosts : []}
            keyExtractor={keyExtractor}
            renderItem={renderPost}
            itemLayoutAnimation={feedReorderLayout}
            initialNumToRender={3}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            ListFooterComponent={
              <View className="px-4">
                {activeTab === "Holders" && <HoldersSection />}
                {activeTab === "About" && (
                  <AboutSection market={market} livePrice={livePrice} />
                )}
              </View>
            }
            ListHeaderComponent={
              <AssetOverview
                market={market}
                livePrice={livePrice}
                tabs={assetTabs}
                activeTabIndex={activeTabIndex}
                onTabChange={handleTabChange}
                isFollowingOnly={isFollowingOnly}
                onFollowingOnlyChange={changeFollowingOnly}
                isLargestFirst={isLargestFirst}
                onSortPress={toggleSort}
              />
            }
          />
        </View>
        <HeaderFade scrollY={scrollY} />
        <ScrollToTopButton
          scrollY={scrollY}
          bottom={tradeBarHeight}
          onPress={handleScrollToTop}
        />
      </View>

      <TradeBar onGoLong={handleGoLong} onGoShort={handleGoShort} />
      {toastMessage && <Toast message={toastMessage} bottom={tradeBarHeight} />}
    </View>
  );
}
