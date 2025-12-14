// var expandContractions = require( '@stdlib/nlp-expand-contractions' );
// var expandContractions = require( '@stdlib/nlp-expand-contractions' );
import expandContractions from '@stdlib/nlp-expand-contractions';


class DictionaryService {
  constructor() {
    this.baseUrl = "https://api.dictionaryapi.dev/api/v2/entries/en";
    this.cache = new Map(); // In-memory cache for API responses
    this.maxCacheSize = 100; // Limit cache size
  }

  /**
   * Fetch word definition from Free Dictionary API
   * @param {string} word - The word to look up
   * @returns {Promise<Object|null>} Dictionary data or null if not found
   */
  async getDefinition(word) {
    if (!word || typeof word !== "string") {
      throw new Error("Word must be a non-empty string");
    }

    // if(word.toLowerCase().match(/^([a-z]+)'([a-z]+)$/)){
    //     console.log("Word with apostrophe detected:", word);
    //     return null; // Skip words with apostrophes
    // }
    // console.log("Checking for apostrophe-like characters in word:", word);

    // if (/[’'‹›`´]/.test('I\'ll')) {
    //     console.log("Apostrophe-like character detected:", word);
    //     return null;
    // }

    // Clean and normalize the word
    // const cleanWord = word.toLowerCase().trim().replace(/[^\w]/g, "");
    // console.log("Cleaned word for lookup:", cleanWord);

    // if (!cleanWord) {
    //   throw new Error("Invalid word format");
    // }

    // Check cache first
    if (this.cache.has(word)) {
      return this.cache.get(word);
    }

    try {
      const response = await fetch(`${this.baseUrl}/${word}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Word not found
          this.cacheResult(word, null);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processedData = this.processApiResponse(data);

      // Cache the result
      this.cacheResult(word, processedData);

      return processedData;
    } catch (error) {
      console.error("Dictionary API error:", error);


      throw error;
    }
  }

  /**
   * Process and normalize API response - Enhanced to extract all valuable data
   * @param {Array} apiResponse - Raw API response
   * @returns {Object} Processed dictionary data
   */
  processApiResponse(apiResponse) {
    if (!Array.isArray(apiResponse) || apiResponse.length === 0) {
      return null;
    }

    const entry = apiResponse[0]; // Use first entry

    return {
      word: entry.word,

      // Enhanced phonetics - multiple pronunciations with regional variations
      phonetics: this.extractPhonetics(entry.phonetics),

      // Backward compatibility
      phonetic: entry.phonetic || this.extractPhonetic(entry.phonetics),
      audio: this.extractAudio(entry.phonetics),

      // Enhanced meanings - all parts of speech with all definitions
      meanings: this.extractMeanings(entry.meanings),

      // Backward compatibility
      definitions: this.extractDefinitions(entry.meanings),

      // Global synonyms and antonyms
      globalSynonyms: this.extractGlobalSynonyms(entry.meanings),
      globalAntonyms: this.extractGlobalAntonyms(entry.meanings),

      // Metadata
      sourceUrls: entry.sourceUrls || [],
      license: entry.license,
    };
  }

  /**
   * Extract ALL phonetic information with regional variations
   * @param {Array} phonetics - Phonetics array from API
   * @returns {Array} Array of phonetic objects
   */
  extractPhonetics(phonetics = []) {
    if (!phonetics || !Array.isArray(phonetics)) return [];

    return phonetics
      .filter((p) => p.text || p.audio) // Only keep entries with text or audio
      .map((phonetic) => ({
        text: phonetic.text || null,
        audio: phonetic.audio || null,
        region: this.detectRegion(phonetic.audio), // Detect UK/US/AU
        sourceUrl: phonetic.sourceUrl,
        license: phonetic.license,
      }));
  }

  /**
   * Detect regional pronunciation from audio URL
   * @param {string} audioUrl - Audio URL
   * @returns {string|null} Region identifier
   */
  detectRegion(audioUrl) {
    if (!audioUrl) return null;
    if (audioUrl.includes("-uk.")) return "UK";
    if (audioUrl.includes("-us.")) return "US";
    if (audioUrl.includes("-au.")) return "AU";
    return "International";
  }

  /**
   * Extract phonetic pronunciation (backward compatibility)
   * @param {Array} phonetics - Phonetics array from API
   * @returns {string} Phonetic pronunciation
   */
  extractPhonetic(phonetics = []) {
    for (const phonetic of phonetics) {
      if (phonetic.text) {
        return phonetic.text;
      }
    }
    return "";
  }

  /**
   * Extract audio pronunciation URL
   * @param {Array} phonetics - Phonetics array from API
   * @returns {string} Audio URL
   */
  extractAudio(phonetics = []) {
    for (const phonetic of phonetics) {
      if (phonetic.audio) {
        return phonetic.audio;
      }
    }
    return "";
  }

  /**
   * Extract and process definitions (backward compatibility)
   * @param {Array} meanings - Meanings array from API
   * @returns {Array} Processed definitions
   */
  extractDefinitions(meanings = []) {
    const definitions = [];

    for (const meaning of meanings.slice(0, 3)) {
      // Limit to 3 parts of speech
      const partOfSpeech = meaning.partOfSpeech;

      for (const definition of meaning.definitions.slice(0, 2)) {
        // Limit to 2 definitions per part
        definitions.push({
          partOfSpeech,
          definition: definition.definition,
          example: definition.example || "",
          synonyms: meaning.synonyms?.slice(0, 3) || [], // Limit synonyms
          antonyms: meaning.antonyms?.slice(0, 3) || [], // Limit antonyms
        });
      }
    }

    return definitions;
  }

  /**
   * Extract ALL meanings with ALL definitions per part of speech
   * @param {Array} meanings - Meanings array from API
   * @returns {Array} Enhanced meanings data
   */
  extractMeanings(meanings = []) {
    if (!meanings || !Array.isArray(meanings)) return [];

    return meanings.map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech,
      definitions: meaning.definitions.map((def) => ({
        definition: def.definition,
        example: def.example || null,
        synonyms: def.synonyms || [],
        antonyms: def.antonyms || [],
      })),
      // Part-specific synonyms and antonyms
      synonyms: meaning.synonyms || [],
      antonyms: meaning.antonyms || [],
    }));
  }

  /**
   * Collect all unique synonyms across all meanings
   * @param {Array} meanings - Meanings array from API
   * @returns {Array} Global synonyms
   */
  extractGlobalSynonyms(meanings = []) {
    const allSynonyms = new Set();

    meanings.forEach((meaning) => {
      // Add meaning-level synonyms
      if (meaning.synonyms) {
        meaning.synonyms.forEach((syn) => allSynonyms.add(syn));
      }

      // Add definition-level synonyms
      meaning.definitions.forEach((def) => {
        if (def.synonyms) {
          def.synonyms.forEach((syn) => allSynonyms.add(syn));
        }
      });
    });

    return Array.from(allSynonyms);
  }

  /**
   * Collect all unique antonyms across all meanings
   * @param {Array} meanings - Meanings array from API
   * @returns {Array} Global antonyms
   */
  extractGlobalAntonyms(meanings = []) {
    const allAntonyms = new Set();

    meanings.forEach((meaning) => {
      // Add meaning-level antonyms
      if (meaning.antonyms) {
        meaning.antonyms.forEach((ant) => allAntonyms.add(ant));
      }

      // Add definition-level antonyms
      meaning.definitions.forEach((def) => {
        if (def.antonyms) {
          def.antonyms.forEach((ant) => allAntonyms.add(ant));
        }
      });
    });

    return Array.from(allAntonyms);
  }

  /**
   * Cache API result with size management
   * @param {string} word - The word key
   * @param {Object|null} result - The result to cache
   */
  cacheResult(word, result) {
    // Manage cache size
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(word, result);
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries: Array.from(this.cache.keys()),
    };
  }

  /**
   * Validate if a word is suitable for dictionary lookup
   * @param {string} word - Word to validate
   * @returns {boolean} True if word is valid for lookup
   */
  isValidWord(word) {
    console.log("Validating word for lookup:", word);

    if (!word || typeof word !== "string") {
      return { valid: false, type: "Invalid" };
    }
    // console.log("Validating word for lookup:", word);

    if (/[’'‹›`´]/.test(word)) {
      console.log("Apostrophe-like character detected:", word);
      const out = expandContractions(word);
      console.log("Expanded contraction:", out);
      return { valid: true, type: "contraction", word: word };
    }

    const cleanWord = word.toLowerCase().trim();

    // Check if it's not just numbers or special characters
    if (!/[a-zA-Z]/.test(cleanWord)) {
      return { valid: false, type: "invalid" };
    }



    return { valid: true, type: 'regular', word: cleanWord };
  }
}

// Export singleton instance
export default new DictionaryService();
