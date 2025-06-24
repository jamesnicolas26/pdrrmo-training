import React, { useEffect } from "react";
import { useAuth } from "../Auth/AuthContext";
import { useNavigate } from "react-router-dom";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
    // Redirect to signin after logout
    navigate("/signin", { replace: true });
  }, [logout, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f4f8",
      }}
    >
      <h1 style={{ color: "#2c3e50" }}>You have been logged out!</h1>
    </div>
  );
};

export default Logout;
