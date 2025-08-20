import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "@tanstack/react-router";
import { LoadingSpinner } from "./LoadingSpinner";

export const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  return children;
};
