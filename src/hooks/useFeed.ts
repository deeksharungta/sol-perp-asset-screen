import { startTransition, useCallback, useMemo, useState } from "react";

import { traderPosts } from "../data/traderPosts";

export function useFeed() {
  const [posts, setPosts] = useState(traderPosts);
  const [isFollowingOnly, setIsFollowingOnly] = useState(true);
  const [isLargestFirst, setIsLargestFirst] = useState(true);

  const visiblePosts = useMemo(() => {
    const sortedPosts = [...posts].sort((a, b) =>
      isLargestFirst
        ? b.positionValue - a.positionValue
        : a.positionValue - b.positionValue,
    );
    return isFollowingOnly
      ? sortedPosts.filter((post) => post.isFollowed)
      : sortedPosts;
  }, [posts, isLargestFirst, isFollowingOnly]);

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

  const changeFollowingOnly = useCallback((value: boolean) => {
    startTransition(() => {
      setIsFollowingOnly(value);
    });
  }, []);

  const toggleSort = useCallback(() => {
    setIsLargestFirst((value) => !value);
  }, []);

  return {
    visiblePosts,
    handleLikePress,
    isFollowingOnly,
    changeFollowingOnly,
    isLargestFirst,
    toggleSort,
  };
}
