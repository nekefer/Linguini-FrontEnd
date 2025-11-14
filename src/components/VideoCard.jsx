import React from "react";
import "../styles/VideoCard.css";

/**
 * VideoCard Component
 * Displays a single trending video with thumbnail, title, channel, and metadata.
 */
const VideoCard = ({ video, onClick }) => {
  const { video_id, title, thumbnails, channel_title, published_at } = video;

  // Get the best available thumbnail
  const thumbnail =
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url;

  // Format published date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(video);
    } else {
      // Default: open YouTube video in new tab
      window.open(`https://www.youtube.com/watch?v=${video_id}`, "_blank");
    }
  };

  return (
    <div
      className="video-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="video-thumbnail">
        <img src={thumbnail} alt={title} loading="lazy" />
        <div className="video-duration-overlay">
          {/* Could add duration here if available */}
        </div>
      </div>
      <div className="video-info">
        <h3 className="video-title" title={title}>
          {title}
        </h3>
        <p className="video-channel">{channel_title}</p>
        <p className="video-metadata">{formatDate(published_at)}</p>
      </div>
    </div>
  );
};

export default VideoCard;
