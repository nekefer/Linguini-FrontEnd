import axios from "axios";

const API_URL = "http://localhost:8000";

axios.defaults.withCredentials = true;

/**
 * Fetch trending videos from YouTube.
 * PUBLIC endpoint - no authentication required.
 *
 * @param {Object} params - Query parameters
 * @param {string} params.region - ISO 3166-1 alpha-2 country code (default: "US")
 * @param {number} params.maxResults - Number of results (1-50, default: 25)
 * @param {string} params.pageToken - Pagination token for next page
 * @param {string} params.categoryId - Optional category filter
 * @returns {Promise<Object>} Response with items[], next_page_token, region, category
 */
export const getTrendingVideos = async ({
  region = "US",
  maxResults = 25,
  pageToken = null,
  categoryId = null,
} = {}) => {
  const params = new URLSearchParams();
  params.append("region", region);
  params.append("max_results", maxResults);
  if (pageToken) params.append("page_token", pageToken);
  if (categoryId) params.append("category_id", categoryId);

  const response = await axios.get(
    `${API_URL}/youtube/trending?${params.toString()}`
  );
  return response.data;
};

/**
 * Fetch last liked video.
 * SECURE endpoint - requires authentication.
 * Reads Google access token from HttpOnly cookie.
 */
export const getLastLikedVideo = async () => {
  const response = await axios.get(`${API_URL}/youtube/last-liked-video`);
  return response.data;
};
