import React, { createContext, useState, useContext, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
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

  const logout = async () => {
  try {
    // Optionally call the server to invalidate the token
    const token = localStorage.getItem("token");
    if (token) {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    // Redirect to signin page immediately
    window.location.href = "/signin";
  }
};


  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const tokenExpiry = JSON.parse(atob(token.split(".")[1])).exp * 1000;
      return tokenExpiry > Date.now();
    } catch (error) {
      console.error("Error parsing token:", error);
      return false;
    }
  };

  const clearAndRegenerateToken = async () => {
    const oldToken = localStorage.getItem("token");
    if (!oldToken || !isTokenValid(oldToken)) {
      console.warn("No valid token found for refresh. Logging out.");
      logout();
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
      const updatedUser = {
        ...user,
        token: data.token,
        role: data.role || user?.role,
      };

      setUser(updatedUser);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error regenerating token:", error.message);
      logout();
    }
  };

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      if (!user) return; // Prevent refresh when user is not logged in

      const token = localStorage.getItem("token");
      if (!token || !isTokenValid(token)) {
        console.log("Invalid or missing token. Logging out.");
        logout();
        return;
      }

      const tokenExpiry = JSON.parse(atob(token.split(".")[1])).exp * 1000;
      const now = Date.now();

      if (tokenExpiry - now < 5 * 60 * 1000) {
        await clearAndRegenerateToken();
      }
    };

    checkAndRefreshToken();
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isTokenValid(token)) {
      setUser(null);
    }
  }, []);

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
