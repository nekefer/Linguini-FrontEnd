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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(form);
      // ✅ Redirect to welcome page after successful registration
      navigate({ to: "/dashboard" });
      onRegister && onRegister();
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="error">{error}</div>}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
        <button type="button" onClick={googleRegister}>
          Register with Google
        </button>
        <div>
          <span>Already have an account? </span>
          <button type="button" onClick={() => navigate({ to: "/login" })}>
            Login here
          </button>
        </div>
      </form>
    </div>
  );
}
