import React, { useState, useEffect } from "react";
import { registerUser, googleRegister, fetchUserInfo } from "../api/auth";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { GuestRoute } from "./GuestRoute";
import "../styles/Register.css";

export const Register = () => {
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "", // ✅ Added password confirmation
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState(""); // ✅ Specific password validation
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const search = useSearch({ from: "/register" });
  const { login } = useAuth();

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

  // ✅ Real-time password validation
  useEffect(() => {
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
    }
  }, [form.password, form.confirmPassword]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear general error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");
    setLoading(true);

    // ✅ Client-side validation before sending to server
    if (form.password !== form.confirmPassword) {
      setPasswordError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending to server
      const { confirmPassword: _confirmPassword, ...registrationData } = form;
      await registerUser(registrationData);

      // Get user info and update auth context
      const userData = await fetchUserInfo();
      login(userData);

      // ✅ Redirect to dashboard after successful registration
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
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
            placeholder="Password (min 8 characters)"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
          />
          {/* ✅ NEW: Password confirmation field */}
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className={passwordError ? "error-input" : ""}
          />
          {/* ✅ Password validation feedback */}
          {passwordError && (
            <div
              className="password-error"
              style={{
                color: "#dc3545",
                fontSize: "0.875rem",
                marginBottom: "10px",
              }}
            >
              {passwordError}
            </div>
          )}
          <button
            type="submit"
            disabled={
              !!passwordError ||
              !form.password ||
              !form.confirmPassword ||
              loading
            }
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <div style={{ margin: "16px 0", textAlign: "center", color: "#666" }}>
            or
          </div>
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
    </GuestRoute>
  );
};
