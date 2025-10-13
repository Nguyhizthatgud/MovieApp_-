import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.jsx";
// useLocation is used to get the current location of the user where were they been before auth
const AuthRequired = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();
  if (!isInitialized) return null;
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export default AuthRequired;
