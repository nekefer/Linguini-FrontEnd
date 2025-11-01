import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { getCaptions, getVocab } from "../api/youtube";
import "../styles/CaptionsViewer.css";

export const CaptionsViewer = () => {
  const navigate = useNavigate();
  const { videoId } = useParams({ from: "/viewer/$videoId" });

  const [captions, setCaptions] = useState(null);
  const [vocab, setVocab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [activeTab, setActiveTab] = useState("captions"); // "captions" | "vocab"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch captions and vocab in parallel
        const [captionsData, vocabData] = await Promise.all([
          getCaptions(videoId),
          getVocab(videoId),
        ]);

        setCaptions(captionsData);
        setVocab(vocabData);
      } catch (err) {
        console.error("Error fetching video data:", err);
        setError(err.response?.data?.detail || "Failed to load video data");
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchData();
    }
  }, [videoId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
  };

  if (loading) {
    return (
      <div className="viewer-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading video data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="viewer-container">
        <div className="error-state">
          <h2>Error Loading Video</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="back-button"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      <div className="viewer-header">
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="back-button"
        >
          ← Back to Dashboard
        </button>
        <h2>Video Learning Tool</h2>
      </div>

      <div className="viewer-content">
        {/* YouTube Player */}
        <div className="video-player">
          <iframe
            width="100%"
            height="400"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          {captions && (
            <div className="video-info">
              <p className="lang-info">
                <strong>Language:</strong> {captions.lang.toUpperCase()}
              </p>
              <p className="source-info">
                <strong>Source:</strong>{" "}
                {captions.source === "human"
                  ? "Human-created"
                  : "Auto-generated"}
              </p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "captions" ? "active" : ""}`}
            onClick={() => setActiveTab("captions")}
          >
            Captions ({captions?.segments?.length || 0})
          </button>
          <button
            className={`tab ${activeTab === "vocab" ? "active" : ""}`}
            onClick={() => setActiveTab("vocab")}
          >
            Vocabulary ({vocab?.tokens?.length || 0})
          </button>
        </div>

        {/* Captions Tab */}
        {activeTab === "captions" && captions && (
          <div className="captions-panel">
            <div className="captions-list">
              {captions.segments.map((segment, index) => (
                <div key={index} className="caption-item">
                  <span className="caption-time">
                    {formatTime(segment.start)}
                  </span>
                  <p className="caption-text">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vocabulary Tab */}
        {activeTab === "vocab" && vocab && (
          <div className="vocab-panel">
            <div className="vocab-grid">
              {vocab.tokens.map((token, index) => (
                <div
                  key={index}
                  className={`vocab-card ${selectedWord?.lemma === token.lemma ? "selected" : ""}`}
                  onClick={() => handleWordClick(token)}
                >
                  <div className="vocab-word">{token.lemma}</div>
                  <div className="vocab-count">×{token.count}</div>
                </div>
              ))}
            </div>

            {/* Word Details */}
            {selectedWord && (
              <div className="word-details">
                <h3>{selectedWord.lemma}</h3>
                <p className="word-frequency">
                  Appears {selectedWord.count} times
                </p>

                {selectedWord.examples.length > 0 && (
                  <div className="examples">
                    <h4>Examples from video:</h4>
                    {selectedWord.examples.map((ex, i) => (
                      <div key={i} className="example-item">
                        <span className="example-time">
                          {formatTime(ex.ts)}
                        </span>
                        <p className="example-text">"{ex.text}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
