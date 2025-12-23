import React, { useState, useEffect, useRef, useCallback } from "react";
import { getCaptions } from "../api/youtube";
import vocabularyService from "../api/vocabulary";

function CaptionPanel({ videoId, currentTime, onSeek, onWordClick }) {
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const captionPanelRef = useRef(null);

  // Memoize the function with useCallback
  const fetchCaptions = useCallback(async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getCaptions(videoId);
      setCaptions(response.captions || []);
    } catch (err) {
      console.error("Failed to fetch captions:", err);
      setError(err.message || "Failed to load captions");
    } finally {
      setLoading(false);
    }
  }, [videoId]); // Dependencies for useCallback

  // Now include fetchCaptions in the dependency array
  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]); // ← Fixed: includes fetchCaptions

  const getCurrentCaptionIndex = () => {
    if (!captions.length) return -1;

    // Small buffer to handle timing discrepancies
    const bufferTime = 0.2; // 200ms buffer for better synchronization
    const adjustedTime = currentTime + bufferTime;

    // Find the caption that should be active at the current time
    for (let i = 0; i < captions.length; i++) {
      const caption = captions[i];
      const nextCaption = captions[i + 1];

      // More forgiving timing logic
      if (adjustedTime >= caption.start) {
        // If this is the last caption OR current time is before next caption starts
        if (!nextCaption || adjustedTime < nextCaption.start) {
          return i;
        }
      }
    }

    return -1;
  };

  const currentCaptionIndex = getCurrentCaptionIndex();

  // Auto-scroll to current caption
  useEffect(() => {
    if (currentCaptionIndex !== -1 && captionPanelRef.current) {
      const captionElement = captionPanelRef.current.querySelector(
        `[data-caption-index="${currentCaptionIndex}"]`
      );

      if (captionElement) {
        // Check if element is already in view to prevent excessive scrolling
        const container = captionPanelRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = captionElement.getBoundingClientRect();

        const isInView =
          elementRect.top >= containerRect.top &&
          elementRect.bottom <= containerRect.bottom;

        if (!isInView) {
          captionElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  }, [currentCaptionIndex]);

  // Handle caption card click (seek to beginning of caption)
  const handleCaptionClick = (captionStartTime) => {
    // console.log("Seeking to caption start:", captionStartTime);
    const buffer = 0.1; // Small buffer to ensure caption is fully visible
    onSeek?.(captionStartTime - buffer);
  };

  // Handle word click for vocabulary learning
  const handleWordClick = async (word, captionStartTime) => {
    // Clean the word (remove punctuation)
    console.log("Word clicked:", word);
    const cleanWord = word
      .replace(/[^\w'’]/g, "") // keep letters, digits, underscores, internal apostrophes
      .toLowerCase();
    console.log("Cleaned word:", cleanWord);
    if (!cleanWord) return;

    try {
      // Find current caption index for context
      const captionIndex = captions.findIndex(
        (caption) => caption.start === captionStartTime
      );

      if (captionIndex === -1) return;

      // Process word with vocabulary service
      const vocabularyData = await vocabularyService.processWordClick(
        cleanWord,
        captions,
        captionIndex,
        currentTime
      );

      // Notify parent component to show vocabulary panel
      if (onWordClick) {
        onWordClick(vocabularyData);
      }
    } catch (error) {
      console.error("Word processing error:", error);
      alert(`Error loading definition for "${cleanWord}": ${error.message}`);
    }
  };

  const parseTextWithTimestamps = (text, captionStart) => {
    const words = text.split(" ");

    return words.map((word, index) => {
      return (
        <span
          key={index}
          className="caption-word"
          onClick={(e) => {
            e.stopPropagation(); // Prevent caption card click
            handleWordClick(word, captionStart);
          }}
          title={`Get definition for "${word}"`}
        >
          {word}{" "}
        </span>
      );
    });
  };

  if (loading) {
    return (
      <div className="caption-panel">
        <div className="caption-loading">Loading captions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="caption-panel">
        <div className="caption-error">
          <p>Failed to load captions</p>
          <button onClick={fetchCaptions} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!captions.length) {
    return (
      <div className="caption-panel">
        <div className="caption-empty">
          No captions available for this video
        </div>
      </div>
    );
  }

  return (
    <div className="caption-panel" ref={captionPanelRef}>
      <div className="caption-header">
        <h3>Captions</h3>
        <p className="caption-info">
          Click caption to seek • Click words for definitions
        </p>
      </div>

      <div className="caption-list">
        {captions.map((caption, index) => (
          <div
            key={index}
            className={`caption-item ${index === currentCaptionIndex ? "active" : ""}`}
            data-caption-index={index}
            onClick={() => handleCaptionClick(caption.start)}
            style={{ cursor: "pointer" }}
            title={`Seek to ${Math.floor(caption.start / 60)}:${String(Math.floor(caption.start % 60)).padStart(2, "0")}`}
          >
            <div className="caption-timestamp">
              {Math.floor(caption.start / 60)}:
              {String(Math.floor(caption.start % 60)).padStart(2, "0")}
              <span className="caption-duration">
                ({caption.duration.toFixed(1)}s)
              </span>
            </div>
            <div className="caption-text">
              {parseTextWithTimestamps(caption.text, caption.start)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CaptionPanel;
