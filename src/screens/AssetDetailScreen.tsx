import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  Share,
  View,
  type FlatList,
  type LayoutChangeEvent,
  type ListRenderItem,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

import { AssetOverview } from "../components/AssetOverview";
import { AboutSection } from "../components/about/AboutSection";
import { TraderCard } from "../components/feed/TraderCard";
import { AssetHeader } from "../components/header/AssetHeader";
import {
  HEADER_FADE_HEIGHT,
  HeaderFade,
} from "../components/header/HeaderFade";
import { HoldersSection } from "../components/holders/HoldersSection";
import { PinnedTabBar } from "../components/tabs/PinnedTabBar";
import { TradeBar, useTradeBarHeight } from "../components/trade/TradeBar";
import { ScrollToTopButton } from "../components/ui/ScrollToTopButton";
import { Toast } from "../components/ui/Toast";
import { solPerpMarket as market } from "../data/market";
import { useFeed } from "../hooks/useFeed";
import { useLivePrice } from "../hooks/useLivePrice";
import { useToast } from "../hooks/useToast";
import { feedReorderLayout } from "../theme/animations";
import { assetTabs } from "../types/market";
import type { TraderPost } from "../types/traderPost";
import { formatUsd } from "../utils/format";

const PAST_CHART_OFFSET = 320;

const keyExtractor = (post: TraderPost) => post.id;

export function AssetDetailScreen() {
  const tradeBarHeight = useTradeBarHeight();
  const livePrice = useLivePrice(market.price);
  const { toastMessage, showToast } = useToast();
  const listRef = useRef<FlatList<TraderPost>>(null);
  const scrollY = useSharedValue(0);
  const indicatorIndex = useSharedValue(0);
  const tabRowY = useSharedValue(0);
  const isHeaderFadeVisible = useDerivedValue(
    () =>
      scrollY.value > 0 && scrollY.value < tabRowY.value - HEADER_FADE_HEIGHT,
  );
  const isPastChart = useDerivedValue(() => scrollY.value > PAST_CHART_OFFSET);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const activeTab = assetTabs[activeTabIndex];

  // Scrolls up to the tab row if needed, so the new tab starts at its top.
  useLayoutEffect(() => {
    listRef.current?.scrollToOffset({
      offset: Math.min(scrollY.value, tabRowY.value),
      animated: false,
    });
  }, [activeTabIndex, scrollY, tabRowY]);
  const {
    visiblePosts,
    toggleLike,
    isFollowingOnly,
    setFollowingOnly,
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
      message: `${market.symbol} is trading at ${formatUsd(livePrice.value)}`,
    });
  }, [livePrice]);

  const handleNotify = useCallback(() => {
    showToast("Price alerts are coming soon");
  }, [showToast]);

  const handleGoLong = useCallback(() => {
    showToast("Long orders are coming soon");
  }, [showToast]);

  const handleGoShort = useCallback(() => {
    showToast("Short orders are coming soon");
  }, [showToast]);

  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleListLayout = (event: LayoutChangeEvent) => {
    setListHeight(event.nativeEvent.layout.height);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pb-3">
        <AssetHeader
          market={market}
          livePrice={livePrice}
          isPastChart={isPastChart}
          onTitlePress={handleScrollToTop}
          onBackPress={handleBack}
          onSharePress={handleShare}
          onNotifyPress={handleNotify}
        />
      </View>

      <View onLayout={handleListLayout} className="flex-1">
        <Animated.FlatList
          ref={listRef}
          contentContainerStyle={{ paddingBottom: tradeBarHeight }}
          data={activeTab === "Feed" ? visiblePosts : []}
          keyExtractor={keyExtractor}
          renderItem={renderPost}
          itemLayoutAnimation={feedReorderLayout}
          initialNumToRender={3}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          ListFooterComponent={
            // Short tabs are padded to a screen so the tab row can stay pinned when you switch to them.
            <View
              className="px-4"
              style={
                activeTab === "Feed"
                  ? undefined
                  : { minHeight: listHeight - tradeBarHeight }
              }
            >
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
              onTabChange={setActiveTabIndex}
              indicatorIndex={indicatorIndex}
              tabRowY={tabRowY}
              showFeedFilters={activeTab === "Feed"}
              isFollowingOnly={isFollowingOnly}
              onFollowingOnlyChange={setFollowingOnly}
              isLargestFirst={isLargestFirst}
              onSortPress={toggleSort}
            />
          }
        />
        <HeaderFade isVisible={isHeaderFadeVisible} />
        <PinnedTabBar
          scrollY={scrollY}
          tabRowY={tabRowY}
          tabs={assetTabs}
          activeIndex={activeTabIndex}
          indicatorIndex={indicatorIndex}
          onChange={setActiveTabIndex}
        />
        <ScrollToTopButton
          scrollY={scrollY}
          bottom={tradeBarHeight}
          onPress={handleScrollToTop}
        />
      </View>

      <TradeBar
        isPastChart={isPastChart}
        onGoLong={handleGoLong}
        onGoShort={handleGoShort}
      />
      {toastMessage && <Toast message={toastMessage} bottom={tradeBarHeight} />}
    </View>
  );
}
