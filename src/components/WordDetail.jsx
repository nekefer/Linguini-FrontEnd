import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import dictionaryService from "../api/dictionary.js";
import vocabularyService from "../api/vocabulary.js";
import styles from "./WordDetail.module.css";

export const WordDetail = ({ word }) => {
  const navigate = useNavigate();
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [defData, saved] = await Promise.all([
          dictionaryService.getDefinition(word),
          vocabularyService.isWordSaved(word),
        ]);
        setDefinition(defData);
        setIsSaved(saved);
      } catch (err) {
        setError(err.message || "Word not found");
      } finally {
        setLoading(false);
      }
    };
    if (word) loadData();
  }, [word]);

  const playAudio = async () => {
    const audioUrl =
      definition?.audio || definition?.phonetics?.find((p) => p.audio)?.audio;
    if (!audioUrl || audioPlaying) return;

    try {
      setAudioPlaying(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setAudioPlaying(false);
      audioRef.current.onerror = () => setAudioPlaying(false);
      await audioRef.current.play();
    } catch {
      setAudioPlaying(false);
    }
  };

  const getPhonetic = () => {
    const p =
      definition?.phonetic || definition?.phonetics?.find((p) => p.text)?.text;
    return p ? (p.startsWith("/") ? p : `/${p}/`) : "";
  };

  const hasAudio = () =>
    definition?.audio || definition?.phonetics?.some((p) => p.audio);

  const handleRemove = async () => {
    if (!confirm(`Remove "${word}" from vocabulary?`)) return;
    await vocabularyService.deleteSavedWord(word);
    navigate({ to: "/my-vocabulary" });
  };

  const lookupWord = (w) =>
    navigate({
      to: "/word/$wordId",
      params: { wordId: encodeURIComponent(w) },
    });

  if (loading) {
    return (
      <div className={styles.wordPage}>
        <div className={styles.wordContainer}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wordPage}>
        <div className={styles.wordContainer}>
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>📖</span>
            <h2>Word not found</h2>
            <p>We couldn't find "{word}" in the dictionary.</p>
            <button onClick={() => navigate({ to: "/my-vocabulary" })}>
              ← Back to vocabulary
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wordPage}>
      <div className={styles.wordContainer}>
        {/* Navigation */}
        <nav className={styles.wordNav}>
          <button
            className={styles.navBack}
            onClick={() => navigate({ to: "/my-vocabulary" })}
          >
            <span>←</span> Back
          </button>
          {isSaved && (
            <button className={styles.navRemove} onClick={handleRemove}>
              Remove
            </button>
          )}
        </nav>

        {/* Word Header Card */}
        <div className={`${styles.wordCard} ${styles.wordHeaderCard}`}>
          <div className={styles.wordMain}>
            <h1>{definition?.word || word}</h1>
            <div className={styles.wordMeta}>
              {getPhonetic() && (
                <span className={styles.phonetic}>{getPhonetic()}</span>
              )}
              {hasAudio() && (
                <button
                  className={`${styles.audioBtn} ${audioPlaying ? styles.playing : ""}`}
                  onClick={playAudio}
                  disabled={audioPlaying}
                >
                  {audioPlaying ? "●" : "▶"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Definitions */}
        {definition?.meanings?.map((meaning, i) => (
          <div key={i} className={`${styles.wordCard} ${styles.meaningCard}`}>
            <div className={styles.posBadge}>{meaning.partOfSpeech}</div>

            <ol className={styles.definitions}>
              {meaning.definitions.map((def, j) => (
                <li key={j}>
                  <p className={styles.defText}>{def.definition}</p>
                  {def.example && (
                    <p className={styles.defExample}>"{def.example}"</p>
                  )}
                </li>
              ))}
            </ol>

            {meaning.synonyms?.length > 0 && (
              <div className={styles.wordLinksSection}>
                <span className={styles.linksLabel}>Synonyms</span>
                <div className={styles.wordLinks}>
                  {meaning.synonyms.slice(0, 6).map((s, k) => (
                    <button key={k} onClick={() => lookupWord(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {meaning.antonyms?.length > 0 && (
              <div className={styles.wordLinksSection}>
                <span className={styles.linksLabel}>Antonyms</span>
                <div className={`${styles.wordLinks} ${styles.antonyms}`}>
                  {meaning.antonyms.slice(0, 6).map((a, k) => (
                    <button key={k} onClick={() => lookupWord(a)}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Related Words */}
        {(definition?.globalSynonyms?.length > 0 ||
          definition?.globalAntonyms?.length > 0) && (
          <div className={`${styles.wordCard} ${styles.relatedCard}`}>
            <h3>Related Words</h3>

            {definition.globalSynonyms?.length > 0 && (
              <div className={styles.relatedGroup}>
                <span className={styles.relatedLabel}>Similar</span>
                <div className={styles.relatedChips}>
                  {definition.globalSynonyms.map((s, i) => (
                    <button key={i} onClick={() => lookupWord(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {definition.globalAntonyms?.length > 0 && (
              <div className={styles.relatedGroup}>
                <span className={styles.relatedLabel}>Opposite</span>
                <div className={`${styles.relatedChips} ${styles.opposite}`}>
                  {definition.globalAntonyms.map((a, i) => (
                    <button key={i} onClick={() => lookupWord(a)}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordDetail;
