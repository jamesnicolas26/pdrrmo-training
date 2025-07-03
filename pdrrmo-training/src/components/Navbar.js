// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

const Navbar = () => {
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  // Fetch user role on component load
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserRole(data.role);  // Store the user role
      } catch (error) {
        console.error("Error fetching user role:", error.message);
      }
    };

    fetchUserRole();
  }, []);

  // Hide navbar on specific pages
const hideNavbar =
  location.pathname.startsWith("/edituser/") ||
  location.pathname === "/signup" ||
  location.pathname === "/signin";
if (hideNavbar) {
  return null;
}


  return (
    <nav
      style={{
        top: 0,
        left: 0,
        width: "100%",
        background: "#333",
        color: "#fff",
        padding: "1rem",
        zIndex: 1000,
      }}
    >
      <ul
        style={{
          display: "flex",
          justifyContent: "space-around",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        <li><Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link></li>
        <li><Link to="/trainings" style={{ color: "#fff", textDecoration: "none" }}>Trainings</Link></li>
        <li><Link to="/users" style={{ color: "#fff", textDecoration: "none" }}>Users</Link></li>
        <li><Link to="/signout" style={{ color: "#fff", textDecoration: "none" }}>Logout</Link></li>

        {/* Conditionally render Add Office link */}
        {userRole === "superadmin" && (
          <li><Link to="/add-office" style={{ color: "#fff", textDecoration: "none" }}>Add Office</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
