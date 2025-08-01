import React, { useState, useEffect } from "react";
import { registerUser, googleRegister } from "../api/auth";
import { useNavigate, useSearch } from "@tanstack/react-router";
import "../styles/Register.css";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const search = useSearch({ from: "/register" });

  // ✅ Handle error messages from URL params (e.g., from Google OAuth redirects)
  useEffect(() => {
    if (search?.error) {
      if (search.error === "user_not_found") {
        setError("No account found with this email. Please register first.");
      } else if (search.error === "oauth_failed") {
        setError("Google authentication failed. Please try again.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  }, [search]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(form);
      // ✅ Redirect to welcome page after successful registration
      navigate({ to: "/welcome" });
      onRegister && onRegister();
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && (
          <div style={{ color: "red", marginBottom: "16px" }}>{error}</div>
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ marginBottom: "12px", padding: "8px", width: "100%" }}
        />
        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
          style={{ marginBottom: "12px", padding: "8px", width: "100%" }}
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
          style={{ marginBottom: "12px", padding: "8px", width: "100%" }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ marginBottom: "16px", padding: "8px", width: "100%" }}
        />
        <button
          type="submit"
          style={{ padding: "10px 20px", marginBottom: "16px", width: "100%" }}
        >
          Register
        </button>

        {/* ✅ Add Google OAuth registration */}
        <button
          type="button"
          onClick={googleRegister}
          style={{
            padding: "10px 20px",
            marginBottom: "16px",
            width: "100%",
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Register with Google
        </button>

        <div style={{ textAlign: "center" }}>
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            style={{
              background: "none",
              border: "none",
              color: "blue",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Login here
          </button>
        </div>
      </form>
    </div>
  );
}
