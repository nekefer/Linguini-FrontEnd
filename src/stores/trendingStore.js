import { create } from "zustand";
import { getTrendingVideos } from "../api/youtube";

/**
 * Trending Videos Store
 * Manages trending videos state with pagination support.
 */
const useTrendingStore = create((set, get) => ({
  // State
  videos: [],
  nextPageToken: null,
  region: "US",
  category: null,
  loading: false,
  error: null,
  hasMore: true,

  // Actions
  fetchTrending: async ({
    region = "US",
    maxResults = 25,
    categoryId = null,
    reset = false,
  } = {}) => {
    const state = get();

    // Prevent duplicate requests
    if (state.loading) return;

    // If reset, clear existing data
    if (reset) {
      set({
        videos: [],
        nextPageToken: null,
        region,
        category: categoryId,
        hasMore: true,
        error: null,
      });
    }

    set({ loading: true, error: null });

    try {
      const response = await getTrendingVideos({
        region: reset ? region : state.region,
        maxResults,
        pageToken: reset ? null : state.nextPageToken,
        categoryId: reset ? categoryId : state.category,
      });

      set((state) => ({
        videos: reset ? response.items : [...state.videos, ...response.items],
        nextPageToken: response.next_page_token || null,
        region: response.region,
        category: response.category,
        hasMore: !!response.next_page_token,
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch trending videos:", error);
      set({
        error: error.response?.data?.detail || "Failed to load trending videos",
        loading: false,
      });
    }
  },

  loadMore: async () => {
    const state = get();
    if (!state.hasMore || state.loading) return;

    await state.fetchTrending({
      region: state.region,
      categoryId: state.category,
      reset: false,
    });
  },

  changeRegion: async (region) => {
    await get().fetchTrending({ region, reset: true });
  },

  changeCategory: async (categoryId) => {
    const state = get();
    await state.fetchTrending({
      region: state.region,
      categoryId,
      reset: true,
    });
  },

  reset: () => {
    set({
      videos: [],
      nextPageToken: null,
      region: "US",
      category: null,
      loading: false,
      error: null,
      hasMore: true,
    });
  },
}));

export default useTrendingStore;
