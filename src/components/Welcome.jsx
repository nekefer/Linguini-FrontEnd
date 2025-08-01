import React from "react";
import { useNavigate } from "@tanstack/react-router";
import "./Welcome.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="gradient-text">Linguini</span>
            </h1>
            <p className="hero-subtitle">
              Your personal language learning companion. Master new languages
              with AI-powered lessons, interactive exercises, and personalized
              learning paths.
            </p>
            <div className="hero-buttons">
              <button
                className="btn-primary"
                onClick={() => navigate({ to: "/register" })}
              >
                Get Started Free
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate({ to: "/login" })}
              >
                Sign In
              </button>
            </div>
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🎯</span>
                <span>Personalized Learning</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🤖</span>
                <span>AI-Powered</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📱</span>
                <span>Learn Anywhere</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-content">
                <div className="language-badge">🇪🇸 Spanish</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "75%" }}></div>
                </div>
                <div className="streak">🔥 7 day streak</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-content">
                <div className="language-badge">🇫🇷 French</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "45%" }}></div>
                </div>
                <div className="streak">⭐ 3 day streak</div>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-content">
                <div className="language-badge">🇯🇵 Japanese</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "20%" }}></div>
                </div>
                <div className="streak">🌱 New learner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="social-proof">
        <div className="social-proof-content">
          <p className="social-proof-text">
            Join <strong>10,000+</strong> learners worldwide
          </p>
          <div className="testimonials">
            <div className="testimonial">
              <div className="testimonial-avatar">👤</div>
              <p>"Linguini made learning Spanish fun and easy!"</p>
            </div>
            <div className="testimonial">
              <div className="testimonial-avatar">👤</div>
              <p>"The AI adapts perfectly to my learning style."</p>
            </div>
            <div className="testimonial">
              <div className="testimonial-avatar">👤</div>
              <p>"Best language app I've ever used!"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
