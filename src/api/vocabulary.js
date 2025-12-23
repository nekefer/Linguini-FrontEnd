import dictionaryService from "./dictionary.js";

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

  

}

// Export singleton instance
export default new VocabularyService();
