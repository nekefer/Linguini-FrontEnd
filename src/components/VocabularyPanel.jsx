import React, { useState, useEffect, useRef } from "react";
import vocabularyService from "../api/vocabulary.js";
import styles from "./VocabularyPanel.module.css";

// Save state configuration
const SAVE_STATE_CONFIG = {
  checking: {
    label: "🔍 Checking...",
    className: "primary",
    disabled: true,
  },
  saving: {
    label: "⏳ Saving...",
    className: "primary",
    disabled: true,
  },
  saved: {
    label: "✅ Saved!",
    className: "success",
    disabled: true,
  },
  "already-saved": {
    label: "✅ Already Saved",
    className: "success",
    disabled: true,
  },
  error: {
    label: "❌ Try Again",
    className: "error",
    disabled: false,
  },
  idle: {
    label: "💾 Save Word",
    className: "primary",
    disabled: false,
  },
};

const VocabularyPanel = ({ vocabularyData, videoId, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("definition");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const audioRef = useRef(null);
  const modalRef = useRef(null);

  // Save word functionality
  const [saveState, setSaveState] = useState("idle"); // 'idle', 'checking', 'already-saved', 'saving', 'saved', 'error'
  const [saveError, setSaveError] = useState(null);

  // Handle escape key and outside clicks
  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeydown);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent body scroll
    }

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset state when panel opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("definition");
      setAudioPlaying(false);
      setPlayingAudioIndex(null);
      setSaveState("checking");
      setSaveError(null);
    }
  }, [isOpen, vocabularyData?.word]);

  // Check if word is already saved when panel opens
  useEffect(() => {
    if (isOpen && vocabularyData?.word && saveState === "checking") {
      vocabularyService
        .isWordSaved(vocabularyData.word)
        .then((isSaved) => {
          setSaveState(isSaved ? "already-saved" : "idle");
        })
        .catch((error) => {
          console.error("Failed to check if word is saved:", error);
          setSaveState("idle"); // Default to allowing save on error
        });
    }
  }, [isOpen, vocabularyData?.word, saveState]);

  // Enhanced audio playback for multiple pronunciations
  const playAudio = async (audioUrl, phoneticIndex) => {
    if (!audioUrl || playingAudioIndex === phoneticIndex) return;

    try {
      setPlayingAudioIndex(phoneticIndex);
      setAudioPlaying(true);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setAudioPlaying(false);
        setPlayingAudioIndex(null);
      };
      audioRef.current.onerror = () => {
        setAudioPlaying(false);
        setPlayingAudioIndex(null);
        console.error("Audio playback failed");
      };

      await audioRef.current.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      setAudioPlaying(false);
      setPlayingAudioIndex(null);
    }
  };

  // Handle audio playback (backward compatibility)
  const playPronunciation = async () => {
    const audioUrl = vocabularyData?.definition?.audio;
    if (!audioUrl || audioPlaying) return;

    try {
      setAudioPlaying(true);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setAudioPlaying(false);
      audioRef.current.onerror = () => {
        setAudioPlaying(false);
        console.error("Audio playback failed");
      };

      await audioRef.current.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      setAudioPlaying(false);
    }
  };

  // Format pronunciation display
  const formatPhonetic = (phonetic) => {
    if (!phonetic) return "";
    return phonetic.startsWith("/") && phonetic.endsWith("/")
      ? phonetic
      : `/${phonetic}/`;
  };

  // Handle save word
  const handleSaveWord = async () => {
    try {
      setSaveState("saving");
      setSaveError(null);

      await vocabularyService.saveWord(vocabularyData.word, videoId);

      setSaveState("saved");
    } catch (error) {
      console.error("Failed to save word:", error);
      setSaveState("error");
      setSaveError(error.message);
    }
  };

  if (!isOpen || !vocabularyData) {
    return null;
  }

  return (
    <div className={styles.vocabularyPanelOverlay}>
      <div className={styles.vocabularyPanel} ref={modalRef}>
        {/* Header */}
        <div className={styles.vocabularyHeader}>
          <div className={styles.vocabularyTitle}>
            <h2 className={styles.vocabularyWord}>
              {vocabularyData.definition?.word || vocabularyData.word}
            </h2>
            {vocabularyData.definition?.phonetic && (
              <div className={styles.vocabularyPronunciation}>
                <span className={styles.phoneticText}>
                  {formatPhonetic(vocabularyData.definition.phonetic)}
                </span>
                {vocabularyData.definition?.audio && (
                  <button
                    className={`${styles.audioBtn} ${audioPlaying ? styles.playing : ""}`}
                    onClick={playPronunciation}
                    disabled={audioPlaying}
                    title="Play pronunciation"
                  >
                    {audioPlaying ? "🔊" : "🔈"}
                  </button>
                )}
              </div>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Enhanced Tabs */}
        <div className={styles.vocabularyTabs}>
          <button
            className={`${styles.tab} ${activeTab === "definition" ? styles.active : ""}`}
            onClick={() => setActiveTab("definition")}
          >
            <span className={styles.tabIcon}>📖</span>
            <span className={styles.tabLabel}>Definition</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "pronunciation" ? styles.active : ""}`}
            onClick={() => setActiveTab("pronunciation")}
          >
            <span className={styles.tabIcon}>🔊</span>
            <span className={styles.tabLabel}>Pronunciation</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "related" ? styles.active : ""}`}
            onClick={() => setActiveTab("related")}
          >
            <span className={styles.tabIcon}>🔗</span>
            <span className={styles.tabLabel}>Related</span>
          </button>
          <button
            className={`${styles.tab} ${activeTab === "usage" ? styles.active : ""}`}
            onClick={() => setActiveTab("usage")}
          >
            <span className={styles.tabIcon}>📝</span>
            <span className={styles.tabLabel}>Usage</span>
          </button>
        </div>

        {/* Content */}
        <div className={styles.vocabularyContent}>
          {/* Enhanced Definition Tab */}
          {activeTab === "definition" && (
            <div className={styles.definitionContent}>
              {vocabularyData.definition?.meanings?.length > 0
                ? vocabularyData.definition.meanings.map(
                    (meaning, meaningIndex) => (
                      <div key={meaningIndex} className={styles.meaningSection}>
                        <div className={styles.partOfSpeechHeader}>
                          <span className={styles.partOfSpeechBadge}>
                            {meaning.partOfSpeech}
                          </span>

                          {/* Part-specific synonyms */}
                          {meaning.synonyms?.length > 0 && (
                            <div className={styles.miniSynonyms}>
                              Synonyms:{" "}
                              {meaning.synonyms.slice(0, 3).join(", ")}
                              {meaning.synonyms.length > 3 && "..."}
                            </div>
                          )}
                        </div>

                        {/* All definitions for this part of speech */}
                        <div className={styles.definitionsList}>
                          {meaning.definitions.map((def, defIndex) => (
                            <div key={defIndex} className={styles.definitionItem}>
                              <div className={styles.definitionNumber}>
                                {defIndex + 1}.
                              </div>
                              <div className={styles.definitionContentInner}>
                                <p className={styles.definitionText}>
                                  {def.definition}
                                </p>

                                {def.example && (
                                  <div className={styles.exampleText}>
                                    <strong>Example:</strong>{" "}
                                    <em>"{def.example}"</em>
                                  </div>
                                )}

                                {/* Definition-specific synonyms/antonyms */}
                                {(def.synonyms?.length > 0 ||
                                  def.antonyms?.length > 0) && (
                                  <div className={styles.defWordRelations}>
                                    {def.synonyms?.length > 0 && (
                                      <span className={styles.defSynonyms}>
                                        Similar: {def.synonyms.join(", ")}
                                      </span>
                                    )}
                                    {def.antonyms?.length > 0 && (
                                      <span className={styles.defAntonyms}>
                                        Opposite: {def.antonyms.join(", ")}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Part-specific antonyms */}
                        {meaning.antonyms?.length > 0 && (
                          <div className={styles.partAntonyms}>
                            <strong>
                              Antonyms for {meaning.partOfSpeech}:
                            </strong>{" "}
                            {meaning.antonyms.join(", ")}
                          </div>
                        )}
                      </div>
                    )
                  )
                : // Fallback to old structure for backward compatibility
                  vocabularyData.definition?.definitions?.map((def, index) => (
                    <div key={index} className={styles.definitionItem}>
                      <div className={styles.definitionMeta}>
                        <span className={styles.partOfSpeech}>
                          {def.partOfSpeech}
                        </span>
                      </div>
                      <p className={styles.definitionText}>{def.definition}</p>
                      {def.example && (
                        <div className={styles.definitionExample}>
                          <span className={styles.exampleLabel}>Example:</span>
                          <em>"{def.example}"</em>
                        </div>
                      )}
                      {def.synonyms?.length > 0 && (
                        <div className={styles.definitionSynonyms}>
                          <span className={styles.synonymsLabel}>Synonyms:</span>
                          <span className={styles.synonymsList}>
                            {def.synonyms.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
            </div>
          )}

          {/*  Pronunciation Tab */}
          {activeTab === "pronunciation" && (
            <div className={styles.pronunciationContent}>
              <h4>
                How to pronounce "
                {vocabularyData.definition?.word || vocabularyData.word}"
              </h4>

              {vocabularyData.definition?.phonetics?.length > 0 ? (
                <div className={styles.phoneticsList}>
                  {vocabularyData.definition.phonetics.map(
                    (phonetic, index) => (
                      <div key={index} className={styles.phoneticItem}>
                        <div className={styles.phoneticTextWrapper}>
                          {phonetic.text && (
                            <span className={styles.phoneticSymbols}>
                              {formatPhonetic(phonetic.text)}
                            </span>
                          )}
                          {phonetic.region && (
                            <span className={styles.phoneticRegion}>
                              ({phonetic.region})
                            </span>
                          )}
                        </div>

                        {phonetic.audio && (
                          <button
                            className={`${styles.audioPlayBtn} ${playingAudioIndex === index ? styles.playing : ""}`}
                            onClick={() => playAudio(phonetic.audio, index)}
                            disabled={playingAudioIndex === index}
                          >
                            {playingAudioIndex === index ? "⏹️" : "▶️"}
                            Play {phonetic.region || "Audio"}
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className={styles.noPronunciation}>
                  <p>Limited pronunciation data available</p>
                  {vocabularyData.definition?.phonetic && (
                    <div className={styles.fallbackPronunciation}>
                      <span className={styles.phoneticSymbols}>
                        {formatPhonetic(vocabularyData.definition.phonetic)}
                      </span>
                      {vocabularyData.definition?.audio && (
                        <button
                          className={`${styles.audioPlayBtn} ${audioPlaying ? styles.playing : ""}`}
                          onClick={playPronunciation}
                          disabled={audioPlaying}
                        >
                          {audioPlaying ? "⏹️" : "▶️"} Play Audio
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.pronunciationTips}>
                <h5>Pronunciation Tips</h5>
                <ul>
                  <li>
                    Listen to different regional pronunciations when available
                  </li>
                  <li>Practice with the phonetic symbols</li>
                  <li>Try saying it along with the audio</li>
                  <li>Notice differences between regions (UK, US, AU)</li>
                </ul>
              </div>
            </div>
          )}

          {/*  Related Words Tab */}
          {activeTab === "related" && (
            <div className={styles.relatedContent}>
              {vocabularyData.definition?.globalSynonyms?.length > 0 && (
                <div className={styles.synonymsSection}>
                  <h4>📗 Synonyms (Similar Words)</h4>
                  <div className={styles.wordChips}>
                    {vocabularyData.definition.globalSynonyms.map(
                      (synonym, index) => (
                        <button
                          key={index}
                          className={`${styles.wordChip} ${styles.synonym}`}
                          onClick={() => {
                            console.log(`TODO: Look up "${synonym}"`);
                            // TODO: Implement synonym lookup
                          }}
                          title={`Look up "${synonym}"`}
                        >
                          {synonym}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {vocabularyData.definition?.globalAntonyms?.length > 0 && (
                <div className={styles.antonymsSection}>
                  <h4>📕 Antonyms (Opposite Words)</h4>
                  <div className={styles.wordChips}>
                    {vocabularyData.definition.globalAntonyms.map(
                      (antonym, index) => (
                        <button
                          key={index}
                          className={`${styles.wordChip} ${styles.antonym}`}
                          onClick={() => {
                            console.log(`TODO: Look up "${antonym}"`);
                            // TODO: Implement antonym lookup
                          }}
                          title={`Look up "${antonym}"`}
                        >
                          {antonym}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {!vocabularyData.definition?.globalSynonyms?.length &&
                !vocabularyData.definition?.globalAntonyms?.length && (
                  <div className={styles.noRelatedWords}>
                    <p>
                      No synonyms or antonyms found for "
                      {vocabularyData.definition?.word || vocabularyData.word}"
                    </p>
                    <div className={styles.suggestion}>
                      <p>
                        💡 Try exploring the definition and usage tabs for
                        related concepts!
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/*  Usage Tab */}
          {activeTab === "usage" && (
            <div className={styles.usageContent}>
              {/* Context timeline - show surrounding captions */}
              {(vocabularyData.context?.previous?.length > 0 ||
                vocabularyData.context?.next?.length > 0) && (
                <div className={styles.usageSection}>
                  <h4>🕐 Context Timeline</h4>
                  <div className={styles.contextTimeline}>
                    {/* Previous context */}
                    {vocabularyData.context.previous?.map((caption, index) => (
                      <div
                        key={`prev-${index}`}
                        className={`${styles.contextItem} ${styles.previous}`}
                      >
                        <span className={styles.contextTiming}>Before:</span>
                        <span className={styles.contextText}>"{caption.text}"</span>
                      </div>
                    ))}

                    {/* Current (highlighted) */}
                    {vocabularyData.context.current && (
                      <div className={`${styles.contextItem} ${styles.current}`}>
                        <span className={styles.contextTiming}>Current:</span>
                        <span className={`${styles.contextText} ${styles.highlighted}`}>
                          "{vocabularyData.context.current.text}"
                        </span>
                      </div>
                    )}

                    {/* Next context */}
                    {vocabularyData.context.next?.map((caption, index) => (
                      <div key={`next-${index}`} className={`${styles.contextItem} ${styles.next}`}>
                        <span className={styles.contextTiming}>After:</span>
                        <span className={styles.contextText}>"{caption.text}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.vocabularyFooter}>
          <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={onClose}>
            Close
          </button>

          {saveError && <div className={styles.errorMessage}>{saveError}</div>}

          {(() => {
            const { label, className, disabled } =
              SAVE_STATE_CONFIG[saveState ?? "idle"];
            return (
              <button
                className={`${styles.actionBtn} ${styles[className]}`}
                onClick={handleSaveWord}
                disabled={disabled}
              >
                {label}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default VocabularyPanel;
