import axios from "axios";
import dictionaryService from "./dictionary.js";

const API_URL = "http://localhost:8000";

// ✅ Configure axios to send cookies automatically
axios.defaults.withCredentials = true;

class VocabularyService {
  constructor() {
    // This service handles vocabulary word processing and context capture
    // Note: Analytics and statistics tracking should be handled by the backend
  }

  /**
   * Capture context when user clicks on a word
   * @param {string} word - The clicked word
   * @param {Array} captions - All available captions
   * @param {number} currentIndex - Current caption index
   * @param {number} currentTime - Current video time
   * @returns {Object} Context data for the word
   */
  captureWordContext(word, captions, currentIndex, currentTime) {
    if (!word || !captions || currentIndex < 0) {
      throw new Error("Invalid parameters for context capture");
    }

    const context = this.buildContext(captions, currentIndex);
    const contextData = {
      word: word.toLowerCase().trim(),
      timestamp: currentTime,
      captureTime: new Date().toISOString(),
      context: context,
      videoPosition: {
        index: currentIndex,
        total: captions.length,
      },
    };

    return contextData;
  }

  /**
   * Build context from surrounding captions
   * @param {Array} captions - All captions
   * @param {number} currentIndex - Current caption index
   * @returns {Object} Context object with previous, current, and next captions
   */
  buildContext(captions, currentIndex) {
    const context = {
      previous: [],
      current: null,
      next: [],
    };

    // Get current caption
    if (currentIndex >= 0 && currentIndex < captions.length) {
      context.current = {
        text: captions[currentIndex].text,
      };
    }

    // Get previous captions (up to 2)
    for (let i = Math.max(0, currentIndex - 2); i < currentIndex; i++) {
      if (captions[i]) {
        context.previous.push({
          text: captions[i].text,
        });
      }
    }

    // Get next captions (up to 2)
    for (
      let i = currentIndex + 1;
      i < Math.min(captions.length, currentIndex + 3);
      i++
    ) {
      if (captions[i]) {
        context.next.push({
          text: captions[i].text,
        });
      }
    }

    return context;
  }

  /**
   * Process word click and get complete vocabulary data
   * @param {string} word - The clicked word
   * @param {Array} captions - All captions
   * @param {number} currentIndex - Current caption index
   * @param {number} currentTime - Current video time
   * @returns {Promise<Object>} Complete vocabulary data
   */
  async processWordClick(word, captions, currentIndex, currentTime) {
    try {
      // Validate word
      if (!dictionaryService.isValidWord(word)) {
        throw new Error(`"${word}" is not a valid word for dictionary lookup`);
      }

      // Capture context
      const contextData = this.captureWordContext(
        word,
        captions,
        currentIndex,
        currentTime
      );

      // Get dictionary definition
      const definition = await dictionaryService.getDefinition(word);

      if (!definition) {
        throw new Error(`No definition found for "${word}"`);
      }

      // Combine context and definition
      const vocabularyData = {
        ...contextData,
        definition: definition,
      };

      console.log("Vocabulary data processed successfully:", vocabularyData);

      return vocabularyData;
    } catch (error) {
      console.error("Vocabulary processing error:", error);
      throw error;
    }
  }

  /**
   * Save a word to user's vocabulary collection
   * @param {string} word - The word to save (already validated when modal opened)
   * @param {string} videoId - ID of the video where the word was encountered
   * @returns {Promise<Object>} Save result
   */
  async saveWord(word, videoId) {
    try {
      // No validation needed - word is already validated when modal opened
      const saveData = {
        word: word.toLowerCase().trim(),
        video_id: videoId,
      };

      const response = await axios.post(`${API_URL}/vocabulary/save`, saveData);

      console.log("Word saved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Save word error:", error);
      const errorMessage =
        error.response?.data?.detail || error.message || "Failed to save word";
      throw new Error(errorMessage);
    }
  }

  /**
   * Check if a word is already saved
   * @param {string} word - The word to check
   * @returns {Promise<boolean>} Whether the word is saved
   */
  async isWordSaved(word) {
    try {
      if (!word) return false;

      const cleanWord = word.toLowerCase().trim();
      const response = await axios.get(
        `${API_URL}/vocabulary/check/${encodeURIComponent(cleanWord)}`
      );

      return response.data.saved || false;
    } catch (error) {
      console.error("Check word saved error:", error);
      return false;
    }
  }

  /**
   * Get user's saved words
   * @param {number} skip - Number of words to skip
   * @param {number} limit - Number of words to fetch
   * @returns {Promise<Object>} List of saved words
   */
  async getSavedWords(skip = 0, limit = 100) {
    try {
      const response = await axios.get(`${API_URL}/vocabulary/saved`, {
        params: { skip, limit },
      });

      return response.data;
    } catch (error) {
      console.error("Get saved words error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch saved words";
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a saved word
   * @param {string} word - The word to delete
   * @returns {Promise<Object>} Delete result
   */
  async deleteSavedWord(word) {
    try {
      const cleanWord = word.toLowerCase().trim();
      const response = await axios.delete(
        `${API_URL}/vocabulary/${encodeURIComponent(cleanWord)}`
      );

      return response.data;
    } catch (error) {
      console.error("Delete word error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Failed to delete word";
      throw new Error(errorMessage);
    }
  }
}

// Export singleton instance
export default new VocabularyService();
