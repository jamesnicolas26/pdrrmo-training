import React from "react";
import { useAuth } from "../Auth/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const { user } = useAuth(); // Get user from context (reactive and up-to-date)
  const location = useLocation();

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
        <li>
          <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
            Home
          </Link>
        </li>

        <li>
          <Link to="/trainings" style={{ color: "#fff", textDecoration: "none" }}>
            Trainings
          </Link>
        </li>

        {user?.role === "Member" ? (
          <li>
            <Link to={`/edituser/${user.id}`} style={{ color: "#fff", textDecoration: "none" }}>
              Edit Profile
            </Link>
          </li>
        ) : (
          <li>
            <Link to="/users" style={{ color: "#fff", textDecoration: "none" }}>
              Users
            </Link>
          </li>
        )}

        <li>
          <Link to="/signout" style={{ color: "#fff", textDecoration: "none" }}>
            Logout
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
