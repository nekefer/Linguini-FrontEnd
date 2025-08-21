import React, { useState, useEffect } from "react";
import { loginUser, googleLogin } from "../api/auth";
import { useNavigate, useSearch } from "@tanstack/react-router";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });

  // ✅ Handle error messages from URL params (only OAuth failures now)
  useEffect(() => {
    if (search?.error) {
      if (search.error === "oauth_failed") {
        setError("Google authentication failed. Please try again.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(email, password);
      console.log("Login successful:", data);
      // ✅ Removed localStorage - cookies are set automatically by the backend

      // ✅ Redirect to dashboard after successful login
      navigate({ to: "/dashboard" });
      onLogin && onLogin();
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        <button type="button" onClick={googleLogin}>
          Continue with Google
        </button>
        <div>
          <span>Don't have an account? </span>
          <button type="button" onClick={() => navigate({ to: "/register" })}>
            Register here
          </button>
        </div>
      </form>
    </div>
  );
}
