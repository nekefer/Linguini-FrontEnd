import React from "react";
import { logoutUser } from "../api/auth";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout(); // Update auth context
      navigate({ to: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
      logout(); // Update auth context even if logout fails
      navigate({ to: "/" });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!user) return <div>No user data available</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Welcome, {user.first_name}!</h2>
        <button
          onClick={handleLogout}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
      <p>This is your dashboard.</p>
      <div>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Name:</strong> {user.first_name} {user.last_name}
        </p>
        {user.auth_method && (
          <p>
            <strong>Auth Method:</strong> {user.auth_method}
          </p>
        )}
      </div>
    </div>
  );
}
