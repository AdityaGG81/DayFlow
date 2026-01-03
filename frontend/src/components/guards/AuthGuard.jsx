import React from "react";
import { Navigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { useAuth } from "../../context/AuthContext";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ClipLoader size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
