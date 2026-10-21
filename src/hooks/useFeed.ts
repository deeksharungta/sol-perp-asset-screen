import { useCallback, useMemo, useState } from "react";

import { traderPosts } from "../data/traderPosts";

export function useFeed() {
  const [posts, setPosts] = useState(traderPosts);
  const [isFollowingOnly, setIsFollowingOnly] = useState(true);
  const [isLargestFirst, setIsLargestFirst] = useState(true);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) =>
      isLargestFirst
        ? b.positionValue - a.positionValue
        : a.positionValue - b.positionValue,
    );
  }, [posts, isLargestFirst]);

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

  const toggleSort = () => {
    setIsLargestFirst(!isLargestFirst);
  };

  return {
    sortedPosts,
    handleLikePress,
    isFollowingOnly,
    setIsFollowingOnly,
    isLargestFirst,
    toggleSort,
  };
}
