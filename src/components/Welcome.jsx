import React from "react";
import { useNavigate } from "@tanstack/react-router";
import styles from "./Welcome.module.css";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Welcome to Linguini</h1>
            <p className={styles.heroSubtitle}>
              Your personal language learning companion. Master new languages
              with AI-powered lessons, interactive exercises, and personalized
              learning paths.
            </p>
            <div className={styles.heroButtons}>
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

      <div className={styles.heroFeatures}>
        <div className={styles.featureCard}>
          <h3>Personalized Learning</h3>
          <p>AI-powered lessons that adapt to your learning style and pace.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Interactive Exercises</h3>
          <p>Engage with interactive exercises to reinforce your learning.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>Learn Anywhere</h3>
          <p>Access your lessons on any device, anytime, anywhere.</p>
        </div>
      </div>
    </div>
  );
}
