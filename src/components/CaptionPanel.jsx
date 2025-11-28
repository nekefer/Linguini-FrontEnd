import React, { useState, useEffect, useRef } from 'react';
import { getCaptions } from '../api/youtube';

function CaptionPanel({ videoId, currentTime, onSeek }) {
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const captionPanelRef = useRef(null);

  useEffect(() => {
    const fetchCaptionsForVideo = async () => {
      if (!videoId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCaptions(videoId);
        setCaptions(response.captions || []);
      } catch (err) {
        console.error('Failed to fetch captions:', err);
        setError(err.message || 'Failed to load captions');
      } finally {
        setLoading(false);
      }
    };

    fetchCaptionsForVideo();
  }, [videoId]);

  const fetchCaptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCaptions(videoId);
      setCaptions(response.captions || []);
    } catch (err) {
      console.error('Failed to fetch captions:', err);
      setError(err.message || 'Failed to load captions');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCaptionIndex = () => {
    if (!captions.length) return -1;
    
    // Find the caption that should be active at the current time
    for (let i = 0; i < captions.length; i++) {
      const caption = captions[i];
      const nextCaption = captions[i + 1];
      
      if (currentTime >= caption.start) {
        // If this is the last caption or current time is before next caption
        if (!nextCaption || currentTime < nextCaption.start) {
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
      const captionElement = captionPanelRef.current.querySelector(`[data-caption-index="${currentCaptionIndex}"]`);
      if (captionElement) {
        captionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentCaptionIndex]);

  const handleWordClick = (timestamp) => {
    // Call the onSeek prop to seek video to specific time
    onSeek?.(timestamp);
  };

  const parseTextWithTimestamps = (text, startTime) => {
    // Simple word splitting - could be enhanced with more sophisticated parsing
    const words = text.split(' ');
    const wordDuration = 2; // Estimate 2 seconds per word
    
    return words.map((word, index) => {
      const wordTimestamp = startTime + (index * wordDuration);
      return (
        <span
          key={index}
          className="caption-word"
          onClick={() => handleWordClick(wordTimestamp)}
          title={`Seek to ${Math.floor(wordTimestamp / 60)}:${String(Math.floor(wordTimestamp % 60)).padStart(2, '0')}`}
        >
          {word}{' '}
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
        <div className="caption-empty">No captions available for this video</div>
      </div>
    );
  }

  return (
    <div className="caption-panel" ref={captionPanelRef}>
      <div className="caption-header">
        <h3>Captions</h3>
        <p className="caption-info">{captions.length} captions available</p>
      </div>
      
      <div className="caption-list">
        {captions.map((caption, index) => (
          <div
            key={index}
            className={`caption-item ${index === currentCaptionIndex ? 'active' : ''}`}
            data-caption-index={index}
          >
            <div className="caption-timestamp">
              {Math.floor(caption.start / 60)}:{String(Math.floor(caption.start % 60)).padStart(2, '0')}
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