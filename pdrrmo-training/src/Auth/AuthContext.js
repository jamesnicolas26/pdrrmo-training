import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";
const AuthContext = createContext();
let inactivityTimer;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (userData) => {
    try {
      if (!userData.role) {
        console.error("Role is missing in user data during login.");
        throw new Error("User role is required.");
      }
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = () => {
    console.warn("Logging out user.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    clearTimeout(inactivityTimer);
    navigate("/signin");
  };

  const clearAndRegenerateToken = async () => {
    const oldToken = localStorage.getItem("token");
    const currentUser = localStorage.getItem("user");

    if (!oldToken || !currentUser) {
      console.warn("User is logged out. Skipping token refresh.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${oldToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate new token.");
      }

      const data = await response.json();

      if (!localStorage.getItem("user")) return;

      const updatedUser = {
        id: data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        office: data.office,
        role: data.role,
        token: data.token,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("token", data.token);
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  };

  const startInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.warn("Auto logout due to inactivity.");
      logout();
    }, 5 * 60 * 1000); // 5 minutes
  };

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const tokenExpiry = decoded.exp * 1000;
          const now = Date.now();

          if (tokenExpiry < now) {
            logout(); // Token already expired
          } else if (tokenExpiry - now < 5 * 60 * 1000) {
            await clearAndRegenerateToken(); // Refresh token
          }
        } catch (err) {
          console.error("Invalid token:", err);
          logout();
        }
      }
    };

    if (user) {
      checkAndRefreshToken();
      startInactivityTimer();

      const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
      events.forEach((event) => window.addEventListener(event, startInactivityTimer));

      return () => {
        events.forEach((event) => window.removeEventListener(event, startInactivityTimer));
        clearTimeout(inactivityTimer);
      };
    }
  }, [user]);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        clearAndRegenerateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
