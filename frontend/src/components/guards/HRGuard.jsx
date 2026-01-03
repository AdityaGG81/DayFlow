import React from "react";
import { Navigate } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import { useAuth } from "../../context/AuthContext";

export default function HRGuard({ children }) {
  return (
    <AuthGuard>
      <Inner>{children}</Inner>
    </AuthGuard>
  );
}

function Inner({ children }) {
  const { user } = useAuth();
  if (!user) return null; // AuthGuard handles redirect/loading
  if (!(user.role === "HR" || user.role === "ADMIN")) {
    return <Navigate to="/employee" replace />;
  }
  return children;
}
