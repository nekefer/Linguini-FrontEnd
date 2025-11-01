import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { getLastLikedVideo, googleLogin } from "../api/auth";
import { getTrending } from "../api/youtube";
import "../styles/Dashboard.css";

export const Dashboard = () => {
  const { user, logout, googleTokensValid } = useAuth(); // ✅ NEW: Get Google token status
  const navigate = useNavigate();

  // Last liked video state
  const [lastLikedVideo, setLastLikedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);

  // Trending videos state
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingError, setTrendingError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("US");
  const [selectedLang, setSelectedLang] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const fetchLastLikedVideo = useCallback(async () => {
    try {
      setVideoLoading(true);
      setVideoError(null);
      const video = await getLastLikedVideo();
      setLastLikedVideo(video);
    } catch (error) {
      console.error("Error fetching last liked video:", error);
      setVideoError(
        error.response?.data?.detail || "Failed to fetch last liked video"
      );
    } finally {
      setVideoLoading(false);
    }
  }, []);

  const fetchTrendingVideos = useCallback(async () => {
    setTrendingLoading(true);
    setTrendingError(null);

    try {
      const videos = await getTrending(selectedRegion, selectedLang || null);
      setTrendingVideos(videos);
    } catch (error) {
      console.error("Error fetching trending videos:", error);
      setTrendingError(
        error.response?.data?.detail || "Failed to fetch trending videos"
      );
    } finally {
      setTrendingLoading(false);
    }
  }, [selectedRegion, selectedLang]);

  useEffect(() => {
    // Fetch trending videos for everyone
    fetchTrendingVideos();

    // ✅ UPDATED: Only fetch last liked video if Google tokens are valid
    if (
      user &&
      user.auth_method &&
      (user.auth_method === "google" || user.auth_method === "both") &&
      googleTokensValid // ✅ NEW: Check Google token validity
    ) {
      fetchLastLikedVideo();
    } else if (user && !googleTokensValid) {
      // ✅ NEW: User logged in but Google tokens expired
      setVideoLoading(false);
      setVideoError("google_expired"); // Special marker for UI
    } else {
      setVideoLoading(false);
      setVideoError("Please sign in with Google to view your last liked video");
    }
  }, [user, googleTokensValid, fetchTrendingVideos, fetchLastLikedVideo]); // ✅ NEW: Add googleTokensValid to deps

  const openVideoViewer = (videoId) => {
    navigate({ to: `/viewer/${videoId}` });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user.first_name}!</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="user-info">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Name:</strong> {user.first_name} {user.last_name}
        </p>
        {user.auth_method && (
          <p>
            <strong>Auth Method:</strong> {user.auth_method}
          </p>
        )}
      </div>

      {/* Trending Videos Section */}
      <div className="trending-section">
        <div className="section-header">
          <h3>Trending Videos</h3>
          <div className="filters">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="filter-select"
            >
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="FR">🇫🇷 France</option>
              <option value="ES">🇪🇸 Spain</option>
              <option value="DE">🇩🇪 Germany</option>
              <option value="JP">🇯🇵 Japan</option>
              <option value="KR">🇰🇷 South Korea</option>
              <option value="BR">🇧🇷 Brazil</option>
            </select>

            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="filter-select"
            >
              <option value="">All Languages</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="pt">Português</option>
            </select>

            <button onClick={fetchTrendingVideos} className="refresh-button">
              Refresh
            </button>
          </div>
        </div>

        {trendingLoading && (
          <div className="loading-message">Loading trending videos...</div>
        )}

        {trendingError && (
          <div className="error-message">
            <p>{trendingError}</p>
          </div>
        )}

        {!trendingLoading && trendingVideos.length > 0 && (
          <div className="trending-grid">
            {trendingVideos.map((video) => (
              <div
                key={video.video_id}
                className="trending-card"
                onClick={() => openVideoViewer(video.video_id)}
              >
                <img src={video.thumbnail} alt={video.title} />
                <div className="trending-info">
                  <h4>{video.title}</h4>
                  <p className="channel">{video.channel_title}</p>
                  {video.lang && (
                    <span className="lang-badge">{video.lang}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!trendingLoading && trendingVideos.length === 0 && !trendingError && (
          <p>No trending videos found for the selected filters.</p>
        )}
      </div>

      {/* Last Liked Video Section */}
      <div className="video-section">
        <h3>Your Last Liked Video</h3>

        {/* ✅ NEW: Google Token Expired Banner */}
        {videoError === "google_expired" && (
          <div className="info-banner">
            <p>
              🔒 Your Google session has expired. Sign in again to access your
              YouTube data.
            </p>
            <button className="google-signin-btn" onClick={googleLogin}>
              Sign in with Google
            </button>
          </div>
        )}

        {videoLoading && (
          <div className="loading-message">
            Loading your last liked video...
          </div>
        )}

        {videoError && videoError !== "google_expired" && (
          <div className="error-message">
            <p>{videoError}</p>
            {user.auth_method !== "google" && user.auth_method !== "both" && (
              <button className="google-signin-button" onClick={googleLogin}>
                Sign in with Google to view YouTube data
              </button>
            )}
          </div>
        )}

        {lastLikedVideo && (
          <div className="video-content">
            {lastLikedVideo.thumbnails?.medium?.url && (
              <img
                src={lastLikedVideo.thumbnails.medium.url}
                alt={lastLikedVideo.title}
                className="video-thumbnail"
              />
            )}
            <div className="video-details">
              <h4>{lastLikedVideo.title}</h4>
              <p className="video-description">
                {lastLikedVideo.description?.substring(0, 200) ??
                  "No description"}
                ...
              </p>
              <a
                href={`https://www.youtube.com/watch?v=${lastLikedVideo.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="youtube-link"
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        )}

        {!videoLoading && !videoError && !lastLikedVideo && (
          <p>No liked videos found.</p>
        )}

        {lastLikedVideo && (
          <button className="refresh-button" onClick={fetchLastLikedVideo}>
            Refresh
          </button>
        )}
      </div>
    </div>
  );
};
