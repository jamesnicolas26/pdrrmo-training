// src/auth/auth.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

export const auth = async () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No token found in localStorage.");
      throw new Error("Token not found");
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to verify token");
      }
  
      const session = await response.json();
      return session; // Assumes session includes user details
    } catch (error) {
      console.error("Error verifying token:", error.message);
      throw new Error("Authentication failed");
    }
  };
  