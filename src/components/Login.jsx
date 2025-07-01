import React, { useState } from "react";
import { loginUser, googleLogin } from "../api/auth";
import "../styles/Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(email, password);
      console.log("Login successful:", data);
      localStorage.setItem("token", data.access_token); // Store JWT

      onLogin && onLogin();
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && (
          <div className="error" style={{ color: "red" }}>
            {error}
          </div>
        )}
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
        <button type="button" onClick={googleLogin} style={{ marginLeft: 8 }}>
          Login with Google
        </button>
      </form>
    </div>
  );
}
