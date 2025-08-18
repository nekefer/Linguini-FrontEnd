import React from "react";
import { useNavigate } from "@tanstack/react-router";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to Linguini</h1>
            <p className="hero-subtitle">
              Your personal language learning companion. Master new languages
              with AI-powered lessons, interactive exercises, and personalized
              learning paths.
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate({ to: "/register" })}>
                Get Started Free
              </button>
              <button onClick={() => navigate({ to: "/login" })}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-features">
        <div className="feature-card">
          <h3>Personalized Learning</h3>
          <p>AI-powered lessons that adapt to your learning style and pace.</p>
        </div>
        <div className="feature-card">
          <h3>Interactive Exercises</h3>
          <p>Engage with interactive exercises to reinforce your learning.</p>
        </div>
        <div className="feature-card">
          <h3>Learn Anywhere</h3>
          <p>Access your lessons on any device, anytime, anywhere.</p>
        </div>
      </div>
    </div>
  );
}
