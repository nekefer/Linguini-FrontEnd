import React, { useState } from "react";
import { registerUser } from "../api/auth";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      await registerUser(form);
      onRegister && onRegister();
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} required />
      <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <button type="submit">Register</button>
    </form>
  );
}
