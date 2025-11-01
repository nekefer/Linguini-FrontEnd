import axios from "axios";

const API_URL = "http://localhost:8000";

// ✅ Configure axios to send cookies automatically
axios.defaults.withCredentials = true;

/**
 * Get trending videos by region and language
 * @param {string} region - ISO 3166-1 alpha-2 country code (e.g., "US", "FR")
 * @param {string|null} lang - BCP-47 language code (e.g., "en", "fr", "es")
 * @param {number} maxResults - Maximum number of results (1-50)
 * @returns {Promise<Array>} List of trending videos
 */
export const getTrending = async (
  region = "US",
  lang = null,
  maxResults = 20
) => {
  const params = { region, max_results: maxResults };
  if (lang) params.lang = lang;

  const response = await axios.get(`${API_URL}/youtube/trending`, { params });
  return response.data;
};

/**
 * Get captions for a specific video
 * @param {string} videoId - YouTube video ID
 * @param {string|null} lang - Preferred caption language
 * @returns {Promise<Object>} Caption data with segments
 */
export const getCaptions = async (videoId, lang = null) => {
  const params = {};
  if (lang) params.lang = lang;

  const response = await axios.get(`${API_URL}/youtube/${videoId}/captions`, {
    params,
  });
  return response.data;
};

/**
 * Get vocabulary extracted from video captions
 * @param {string} videoId - YouTube video ID
 * @param {string|null} lang - Caption language
 * @param {number} topN - Number of top words to return
 * @returns {Promise<Object>} Vocabulary data with word frequencies
 */
export const getVocab = async (videoId, lang = null, topN = 50) => {
  const params = { top_n: topN };
  if (lang) params.lang = lang;

  const response = await axios.get(`${API_URL}/youtube/${videoId}/vocab`, {
    params,
  });
  return response.data;
};
