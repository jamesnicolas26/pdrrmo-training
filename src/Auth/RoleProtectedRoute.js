import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    alert("Access denied. User not logged in.");
    return <Navigate to="/signin" />;
  }

  const hasAccess = Array.isArray(requiredRole)
    ? requiredRole.includes(user.role)
    : user.role === requiredRole;

  if (!hasAccess) {
    alert("Access denied. You do not have the required permissions.");
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleProtectedRoute;
