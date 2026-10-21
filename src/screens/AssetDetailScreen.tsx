import { BlurTargetView } from "expo-blur";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import { Share, View, type FlatList, type ListRenderItem } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { AboutSection } from "../components/about/AboutSection";
import { ChartSection } from "../components/chart/ChartSection";
import { ScrubDetails } from "../components/chart/ScrubDetails";
import { FeedFilters } from "../components/feed/FeedFilters";
import { ScrollToTopButton } from "../components/feed/ScrollToTopButton";
import { TraderCard } from "../components/feed/TraderCard";
import { AssetHeader } from "../components/header/AssetHeader";
import { HoldersSection } from "../components/holders/HoldersSection";
import { HeaderFade } from "../components/header/HeaderFade";
import { PriceSection } from "../components/price/PriceSection";
import { TabBar } from "../components/tabs/TabBar";
import {
  TRADE_BAR_HEIGHT,
  TradeBar,
  useTradeBarInset,
} from "../components/trade/TradeBar";
import { candlesByTimeframe } from "../data/candles";
import { solPerpMarket } from "../data/market";
import { traderPosts } from "../data/traderPosts";
import { useLivePrice } from "../hooks/useLivePrice";
import { feedReorderLayout } from "../theme/animations";
import type { Timeframe } from "../types/candle";
import type { TraderPost } from "../types/traderPost";
import { formatUsd } from "../utils/format";

const assetTabs = ["Feed", "Holders", "About"];

const keyExtractor = (post: TraderPost) => post.id;

function CardSeparator() {
  return <View className="h-2" />;
}

export function AssetDetailScreen() {
  const market = solPerpMarket;
  const tradeBarInset = useTradeBarInset();
  const livePrice = useLivePrice(market.price);
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null);
  const listRef = useRef<FlatList<TraderPost>>(null);
  const scrollY = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const [timeframe, setTimeframe] = useState<Timeframe>("1D");
  const candles = candlesByTimeframe[timeframe];
  // Shared with the chart so the scrub panel can replace the price block without re-renders.
  const scrubIndex = useSharedValue(0);
  const scrubProgress = useSharedValue(0);
  const priceFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrubProgress.value,
      [0, 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = assetTabs[activeTabIndex];
  const [isFollowingOnly, setIsFollowingOnly] = useState(true);
  const [isLargestFirst, setIsLargestFirst] = useState(true);
  const [posts, setPosts] = useState(traderPosts);

  const visiblePosts = useMemo(() => {
    const shownPosts = isFollowingOnly
      ? posts.filter((post) => post.isFollowed)
      : posts;
    return [...shownPosts].sort((a, b) =>
      isLargestFirst
        ? b.positionValue - a.positionValue
        : a.positionValue - b.positionValue,
    );
  }, [posts, isFollowingOnly, isLargestFirst]);

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

  const handleShare = () => {
    Share.share({
      message: `${market.symbol} is trading at ${formatUsd(market.price)}`,
    });
  };

  const handleNotify = () => {};

  const handleSortPress = () => {
    setIsLargestFirst(!isLargestFirst);
  };

  const handleGoLong = () => {};

  const handleGoShort = () => {};

  const handleScrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <View className="flex-1 bg-background">
      <View className="pb-3">
        <AssetHeader
          symbol={market.symbol}
          assetName={market.assetName}
          assetIcon={market.assetIcon}
          exchangeIcon={market.exchangeIcon}
          livePrice={livePrice}
          openPrice={market.openPrice}
          scrollY={scrollY}
          onTitlePress={handleScrollToTop}
          onBack={handleBack}
          onShare={handleShare}
          onNotify={handleNotify}
        />
      </View>

      <View className="flex-1">
        <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
          <Animated.FlatList
            ref={listRef}
            contentContainerStyle={{
              paddingBottom: tradeBarInset + TRADE_BAR_HEIGHT,
            }}
            data={activeTab === "Feed" ? visiblePosts : []}
            keyExtractor={keyExtractor}
            renderItem={renderPost}
            ItemSeparatorComponent={CardSeparator}
            itemLayoutAnimation={feedReorderLayout}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ListFooterComponent={
              activeTab === "Feed" ? undefined : (
                <View className="px-4">
                  {activeTab === "Holders" ? (
                    <HoldersSection />
                  ) : (
                    <AboutSection market={market} livePrice={livePrice} />
                  )}
                </View>
              )
            }
            ListHeaderComponent={
              <View className="gap-6 pb-4 pt-3">
                <View>
                  <Animated.View style={priceFadeStyle}>
                    <PriceSection
                      livePrice={livePrice}
                      openPrice={candles[0].open}
                      timeframe={timeframe}
                      metrics={market.metrics}
                      initialMetric={market.initialMetric}
                    />
                  </Animated.View>
                  <ScrubDetails
                    candles={candles}
                    timeframe={timeframe}
                    scrubIndex={scrubIndex}
                    scrubProgress={scrubProgress}
                  />
                </View>
                <ChartSection
                  candles={candles}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  scrubIndex={scrubIndex}
                  scrubProgress={scrubProgress}
                  livePrice={livePrice}
                />
                <View className="gap-4">
                  <TabBar
                    tabs={assetTabs}
                    activeIndex={activeTabIndex}
                    onChange={setActiveTabIndex}
                  />
                  {activeTab === "Feed" && (
                    <FeedFilters
                      isFollowingOnly={isFollowingOnly}
                      onFollowingOnlyChange={setIsFollowingOnly}
                      isLargestFirst={isLargestFirst}
                      onSortPress={handleSortPress}
                    />
                  )}
                </View>
              </View>
            }
          />
        </BlurTargetView>
        <HeaderFade blurTarget={blurTargetRef} scrollY={scrollY} />
        <ScrollToTopButton
          scrollY={scrollY}
          bottom={tradeBarInset + TRADE_BAR_HEIGHT}
          onPress={handleScrollToTop}
        />
      </View>

      <TradeBar
        blurTarget={blurTargetRef}
        onGoLong={handleGoLong}
        onGoShort={handleGoShort}
      />
    </View>
  );
}
