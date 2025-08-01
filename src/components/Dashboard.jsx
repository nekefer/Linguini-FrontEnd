import React, { useEffect, useState } from "react";
import { fetchUserInfo, logoutUser } from "../api/auth";
import { useNavigate } from "@tanstack/react-router";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Removed localStorage usage - now uses cookies automatically
    fetchUserInfo()
      .then((userData) => {
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch user info:", err);
        setError("Failed to load user information");
        setLoading(false);
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          navigate({ to: "/login" });
        }
      });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate({ to: "/" });
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if logout fails, redirect to root
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
