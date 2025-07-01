import React, { useEffect, useState } from "react";
import { fetchUserInfo } from "../api/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchUserInfo(token)
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome, {user.first_name}!</h2>
      <p>This is your dashboard.</p>
    </div>
  );
}
