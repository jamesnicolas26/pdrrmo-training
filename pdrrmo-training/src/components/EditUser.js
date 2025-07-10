import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const EditUser = ({ updateUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    lastname: "",
    firstname: "",
    middlename: "",
    office: "",
    username: "",
    email: "",
    role: "User",
  });

  const [originalRole, setOriginalRole] = useState(""); // For checking if edited user is superadmin
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Access control
  useEffect(() => {
    if (!loggedInUser) return;

    if (loggedInUser.role === "Member" && loggedInUser.id?.toString() !== id?.toString()) {
      alert("Access denied. Members can only edit their own profile.");
      navigate("/");
    }
  }, [loggedInUser, id, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Authentication error. Please log in again.");
          window.location.href = "/signin";
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert("Authentication expired. Please log in again.");
            localStorage.removeItem("token");
            window.location.href = "/signin";
            return;
          } else if (response.status === 403) {
            setError("Access denied. You are not allowed to view this user.");
            return;
          }

          throw new Error(`Error ${response.status}: Unable to fetch user.`);
        }

        const user = await response.json();
        setOriginalRole(user.role); // Store original role for access check

        setFormData({
          title: user.title || "",
          lastname: user.lastname || "",
          firstname: user.firstname || "",
          middlename: user.middlename || "",
          office: user.office || "",
          username: user.username || "",
          email: user.email || "",
          role: user.role || "User",
        });
      } catch (err) {
        console.error(err.message);
        setError("Failed to load user details. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // Prevent Admins from editing Superadmins
    if (loggedInUser.role === "Admin" && originalRole === "superadmin") {
      setError("Admins are not allowed to modify Superadmin accounts.");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication error. Please log in again.");
        navigate("/signin");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update user.");
      }

      const updatedUser = await response.json();
      updateUser?.(id, updatedUser); // Optional chaining for external state update
      alert("User details updated successfully!");
      navigate(loggedInUser.role === "Member" ? "/" : "/users");
    } catch (err) {
      console.error("Error updating user:", err.message);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const disableRoleEdit =
    loggedInUser.role === "Member" || // Members cannot change role
    (loggedInUser.role === "Admin" && originalRole === "superadmin"); // Admins can't change superadmin role

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f4f8" }}>
      <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", padding: "2rem", maxWidth: "500px", width: "100%" }}>
        <h1 style={{ color: "#2c3e50", marginBottom: "1rem", textAlign: "center" }}>Edit User</h1>

        {isLoading ? (
          <p style={{ textAlign: "center", color: "#7f8c8d" }}>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}>{error}</p>}

            {["title", "lastname", "firstname", "middlename", "office", "username", "email"].map((field) => (
              <div style={{ marginBottom: "1rem" }} key={field}>
                <label style={{ display: "block", marginBottom: "0.5rem", textTransform: "capitalize" }}>{field}</label>
                <input
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  disabled={isLoading}
                  style={{ width: "100%", padding: "0.8rem", borderRadius: "5px", border: "1px solid #dcdfe6" }}
                />
              </div>
            ))}

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={disableRoleEdit}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "5px",
                  border: "1px solid #dcdfe6",
                  backgroundColor: disableRoleEdit ? "#f0f0f0" : "#fff",
                }}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button
                type="submit"
                style={{
                  backgroundColor: "#3498db",
                  color: "#fff",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "5px",
                  border: "none",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate(loggedInUser.role === "Member" ? "/" : "/users")}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "#fff",
                  padding: "0.8rem 1.5rem",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUser;
