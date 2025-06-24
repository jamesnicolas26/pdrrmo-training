import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth(); // Access authentication state and user info
  const location = useLocation();

  // Check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If a required role is specified, ensure the user's role matches
  if (requiredRole && !requiredRole.includes(user?.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
