import React, { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { getLastLikedVideo, googleLogin } from "../api/auth";
import "../styles/Dashboard.css";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lastLikedVideo, setLastLikedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  const fetchLastLikedVideo = async () => {
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
  };

  useEffect(() => {
    // Only fetch if user is authenticated with Google
    if (
      user &&
      user.auth_method &&
      (user.auth_method === "google" || user.auth_method === "both")
    ) {
      fetchLastLikedVideo();
    } else {
      setVideoLoading(false);
      setVideoError("Please sign in with Google to view your last liked video");
    }
  }, [user]);

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

      {/* Last Liked Video Section */}
      <div className="video-section">
        <h3>Your Last Liked Video</h3>

        {videoLoading && (
          <div className="loading-message">
            Loading your last liked video...
          </div>
        )}

        {videoError && (
          <div className="error-message">
            <p>{videoError}</p>
            {user.auth_method !== "google" && user.auth_method !== "both" && (
              <button
                className="google-signin-button"
                onClick={googleLogin}
              >
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
                {lastLikedVideo.description?.substring(0, 200) ?? "No description"}...
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
