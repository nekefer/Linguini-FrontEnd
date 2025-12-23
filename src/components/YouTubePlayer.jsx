import React, { useEffect, useRef } from "react";

function YouTubePlayer({ videoId, onTimeUpdate, onPlayerReady }) {
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Cleanup previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = initPlayer;
    } else if (window.YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      // Destroy existing player if it exists
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handlePlayerStateChange,
        },
      });
    }

    function handlePlayerReady(event) {
      const playerInstance = event.target;
      onPlayerReady?.(playerInstance);
      startTimeTracking();
    }

    function handlePlayerStateChange(event) {
      // Start tracking when playing, stop when paused
      if (event.data === window.YT.PlayerState.PLAYING) {
        startTimeTracking();
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        stopTimeTracking();
      }
    }

    function startTimeTracking() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const currentTime = playerRef.current.getCurrentTime();
          onTimeUpdate?.(currentTime);
        }
      }, 100); // Update 10x per second for smooth caption sync
    }

    function stopTimeTracking() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      stopTimeTracking();
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onTimeUpdate, onPlayerReady]);

  return (
    <div className="youtube-player-container">
      <div id="youtube-player" className="youtube-player"></div>
    </div>
  );
}

export default YouTubePlayer;
