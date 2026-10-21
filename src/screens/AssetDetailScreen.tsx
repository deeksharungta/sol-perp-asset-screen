import { BlurTargetView } from "expo-blur";
import {
  startTransition,
  useCallback,
  useRef,
  useState,
  type ComponentRef,
} from "react";
import { Share, View, type FlatList, type ListRenderItem } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import { AssetOverview } from "../components/AssetOverview";
import { AboutSection } from "../components/about/AboutSection";
import { ScrollToTopButton } from "../components/feed/ScrollToTopButton";
import { TraderCard } from "../components/feed/TraderCard";
import { AssetHeader } from "../components/header/AssetHeader";
import { HoldersSection } from "../components/holders/HoldersSection";
import { HeaderFade } from "../components/header/HeaderFade";
import {
  TRADE_BAR_HEIGHT,
  TradeBar,
  useTradeBarInset,
} from "../components/trade/TradeBar";
import { Toast } from "../components/ui/Toast";
import { solPerpMarket } from "../data/market";
import { useFeed } from "../hooks/useFeed";
import { useLivePrice } from "../hooks/useLivePrice";
import { useToast } from "../hooks/useToast";
import { feedReorderLayout } from "../theme/animations";
import type { TraderPost } from "../types/traderPost";
import { formatUsd } from "../utils/format";

const assetTabs = ["Feed", "Holders", "About"];

const keyExtractor = (post: TraderPost) => post.id;

export function AssetDetailScreen() {
  const market = solPerpMarket;
  const tradeBarInset = useTradeBarInset();
  const livePrice = useLivePrice(market.price);
  const { toastMessage, showToast } = useToast();
  const blurTargetRef = useRef<ComponentRef<typeof View>>(null);
  const listRef = useRef<FlatList<TraderPost>>(null);
  const scrollY = useSharedValue(0);

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  // Shared with the chart so the scrub panel can replace the price block without re-renders.
  const scrubIndex = useSharedValue(0);
  const scrubProgress = useSharedValue(0);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const activeTab = assetTabs[activeTabIndex];
  const {
    sortedPosts,
    handleLikePress,
    isFollowingOnly,
    setIsFollowingOnly,
    isLargestFirst,
    toggleSort,
  } = useFeed();

  const renderPost: ListRenderItem<TraderPost> = useCallback(
    ({ item }) => (
      <View
        className="px-4 pb-2"
        style={{
          display: isFollowingOnly && !item.isFollowed ? "none" : "flex",
        }}
      >
        <TraderCard post={item} onLikePress={handleLikePress} />
      </View>
    ),
    [handleLikePress, isFollowingOnly],
  );

  const handleBack = () => {
    showToast("Back navigation is coming soon");
  };

  const handleShare = () => {
    Share.share({
      message: `${market.symbol} is trading at ${formatUsd(market.price)}`,
    });
  };

  const handleNotify = () => {
    showToast("Price alerts are coming soon");
  };

  const handleTabChange = (index: number) => {
    startTransition(() => {
      setActiveTabIndex(index);
    });
  };

  const handleGoLong = () => {
    showToast("Long orders are coming soon");
  };

  const handleGoShort = () => {
    showToast("Short orders are coming soon");
  };

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
        <BlurTargetView ref={blurTargetRef} className="flex-1 bg-background">
          <Animated.FlatList
            ref={listRef}
            contentContainerStyle={{
              paddingBottom: tradeBarInset + TRADE_BAR_HEIGHT,
            }}
            data={activeTab === "Feed" ? sortedPosts : []}
            keyExtractor={keyExtractor}
            renderItem={renderPost}
            itemLayoutAnimation={feedReorderLayout}
            initialNumToRender={3}
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
              <AssetOverview
                market={market}
                livePrice={livePrice}
                scrubIndex={scrubIndex}
                scrubProgress={scrubProgress}
                tabs={assetTabs}
                activeTabIndex={activeTabIndex}
                onTabChange={handleTabChange}
                isFollowingOnly={isFollowingOnly}
                onFollowingOnlyChange={setIsFollowingOnly}
                isLargestFirst={isLargestFirst}
                onSortPress={toggleSort}
              />
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
      {toastMessage && (
        <Toast
          message={toastMessage}
          bottom={tradeBarInset + TRADE_BAR_HEIGHT}
        />
      )}
    </View>
  );
}
