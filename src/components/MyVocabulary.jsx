import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import vocabularyService from "../api/vocabulary.js";
import dictionaryService from "../api/dictionary.js";
import styles from "./MyVocabulary.module.css";

const WORDS_PER_PAGE = 20;

// Search and sort controls component
const VocabularyControls = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  totalWords,
}) => (
  <div className={styles.vocabularyControls}>
    <div className={styles.vocabularyStats}>
      <h3>📚 My Vocabulary</h3>
      <p className={styles.statsText}>{totalWords} words saved</p>
    </div>

    <div className={styles.controlsSection}>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search your vocabulary..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className={styles.sortSelect}
      >
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="word_asc">A to Z</option>
        <option value="word_desc">Z to A</option>
      </select>
    </div>
  </div>
);

// Individual word card component
const WordCard = ({ wordData, onDelete, onViewVideo, onViewDetails }) => {
  const [definition, setDefinition] = useState(null);
  const [loadingDefinition, setLoadingDefinition] = useState(false);

  const loadDefinition = async () => {
    if (definition || loadingDefinition) return;

    try {
      setLoadingDefinition(true);
      const defData = await dictionaryService.getDefinition(wordData.word);
      setDefinition(defData);
    } catch (error) {
      console.error("Failed to load definition:", error);
      setDefinition({ error: "Failed to load definition" });
    } finally {
      setLoadingDefinition(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${wordData.word}" from your vocabulary?`)) {
      onDelete(wordData.word);
    }
  };

  const handleViewVideo = () => {
    if (wordData.video_id) {
      onViewVideo(wordData.video_id);
    }
  };

  const getDefinitionPreview = () => {
    if (definition?.error) return definition.error;
    if (definition?.meanings?.[0]?.definitions?.[0]?.definition) {
      return definition.meanings[0].definitions[0].definition;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className={styles.wordCard}>
      <div className={styles.wordHeader}>
        <h3 className={styles.wordTitle}>{wordData.word}</h3>
        <div className={styles.wordActions}>
          {wordData.video_id && (
            <button
              className={`${styles.btnIcon} ${styles.videoBtn}`}
              onClick={handleViewVideo}
              title="View in video"
            >
              📹
            </button>
          )}
          <button
            className={`${styles.btnIcon} ${styles.deleteBtn}`}
            onClick={handleDelete}
            title="Delete word"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.wordMeta}>
        <span className={styles.saveDate}>
          Saved {formatDate(wordData.saved_at)}
        </span>
        {wordData.video_id && (
          <span className={styles.videoBadge}>📺 From video</span>
        )}
      </div>

      <div className={styles.wordContent}>
        {loadingDefinition ? (
          <div className={styles.definitionLoading}>Loading definition...</div>
        ) : definition ? (
          <div className={styles.definitionPreview}>
            <p>{getDefinitionPreview()}</p>
            {definition.phonetic && (
              <span className={styles.phonetic}>
                {definition.phonetic.startsWith("/")
                  ? definition.phonetic
                  : `/${definition.phonetic}/`}
              </span>
            )}
            <button
              className={styles.detailsToggle}
              onClick={() => onViewDetails(wordData.word)}
            >
              View Details →
            </button>
          </div>
        ) : (
          <button className={styles.loadDefinitionBtn} onClick={loadDefinition}>
            Show Definition
          </button>
        )}
      </div>
    </div>
  );
};

// Vocabulary grid component
const VocabularyGrid = ({
  words,
  onDelete,
  onViewVideo,
  onViewDetails,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className={styles.vocabularyLoading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your vocabulary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.vocabularyError}>
        <h3>❌ Error Loading Vocabulary</h3>
        <p>{error}</p>
        <button
          className={styles.btnPrimary}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className={styles.vocabularyEmpty}>
        <div className={styles.emptyIcon}>📚</div>
        <h3>No saved words yet</h3>
        <p>Start watching videos and saving words to build your vocabulary!</p>
        <Link to="/dashboard" className={styles.btnPrimary}>
          Browse Videos
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.vocabularyGrid}>
      {words.map((word) => (
        <WordCard
          key={word.id}
          wordData={word}
          onDelete={onDelete}
          onViewVideo={onViewVideo}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

// Main MyVocabulary component
export const MyVocabulary = () => {
  const [savedWords, setSavedWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [totalWords, setTotalWords] = useState(0);

  const navigate = useNavigate();

  // Load saved words
  const loadSavedWords = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await vocabularyService.getSavedWords({
        skip: 0,
        limit: 1000, // Load all words for now
      });

      // Transform backend response to match frontend expectations
      const transformedWords =
        response.words?.map((savedWord) => ({
          id: savedWord.id,
          word: savedWord.word.word, // Extract word text from nested structure
          video_id: savedWord.video_id,
          saved_at: savedWord.saved_at,
          word_id: savedWord.word.id,
          created_at: savedWord.word.created_at,
        })) || [];

      setSavedWords(transformedWords);
      setTotalWords(response.total || transformedWords.length);
    } catch (error) {
      console.error("Failed to load vocabulary:", error);
      setError(error.message || "Failed to load your vocabulary");
      setSavedWords([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete a word from vocabulary
  const handleDeleteWord = async (word) => {
    try {
      await vocabularyService.deleteSavedWord(word);
      // Remove the word from current list
      setSavedWords((prev) => prev.filter((w) => w.word !== word));
      setTotalWords((prev) => prev - 1);
    } catch (error) {
      console.error("Failed to delete word:", error);
      alert("Failed to delete word. Please try again.");
    }
  };

  // Navigate to video player
  const handleViewVideo = (videoId) => {
    navigate({ to: "/player/$videoId", params: { videoId } });
  };

  // Handle viewing word details
  const handleViewDetails = (word) => {
    navigate({
      to: "/word/$wordId",
      params: { wordId: encodeURIComponent(word) },
    });
  };

  // Handle search (client-side for now)
  const getFilteredWords = () => {
    let filtered = [...savedWords];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((word) =>
        word.word.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "word_asc":
        filtered.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "word_desc":
        filtered.sort((a, b) => b.word.localeCompare(a.word));
        break;
      case "date_asc":
        filtered.sort((a, b) => new Date(a.saved_at) - new Date(b.saved_at));
        break;
      case "date_desc":
      default:
        filtered.sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at));
        break;
    }

    return filtered;
  };

  // Load words on component mount
  useEffect(() => {
    loadSavedWords();
  }, []);

  const filteredWords = getFilteredWords();

  return (
    <div className={styles.vocabularyPage}>
      <VocabularyControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalWords={totalWords}
      />

      <VocabularyGrid
        words={filteredWords}
        onDelete={handleDeleteWord}
        onViewVideo={handleViewVideo}
        onViewDetails={handleViewDetails}
        loading={loading}
        error={error}
      />

      {searchTerm && (
        <div className={styles.searchResultsInfo}>
          Found {filteredWords.length} word(s) matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};
