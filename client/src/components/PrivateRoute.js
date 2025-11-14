// client/src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Show loading while auth state is being fetched

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
