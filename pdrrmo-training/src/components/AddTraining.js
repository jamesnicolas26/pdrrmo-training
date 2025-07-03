import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

const AddTraining = ({ addTraining }) => {
  const { user } = useAuth(); // Get the current user's info from AuthContext
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    startDate: "",
    endDate: "",
    hours: "",
    sponsor: "",
    author: "",
    office: "",
    certificate: null,
  });

  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]); // Store fetched authors
  const [trainingTitles, setTrainingTitles] = useState([]); // Training titles from the backend
  const [newTitle, setNewTitle] = useState(""); // New title input
  const fileInputRef = useRef(null);

  const [newOffice, setNewOffice] = useState(""); // For the AddOffice form
  const [userRole, setUserRole] = useState(""); // User role for showing AddOffice
  const [offices, setOffices] = useState([]); // Store fetched offices

  // Fetch training titles and authors
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch training titles without requiring authentication
        const titlesResponse = await fetch(`${API_BASE_URL}/training-titles`);
    
        if (!titlesResponse.ok) {
          throw new Error("Failed to fetch training titles");
        }
    
        const titlesData = await titlesResponse.json();
        setTrainingTitles(titlesData);
    
        // Fetch authors with token if needed
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found");
    
        const authorsResponse = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        if (!authorsResponse.ok) {
          throw new Error("Failed to fetch authors");
        }
    
        const authorsData = await authorsResponse.json();
        setAuthors(authorsData);

        const officesResponse = await fetch(`${API_BASE_URL}/offices`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!officesResponse.ok) {
          throw new Error("Failed to fetch offices");
        }

        const officesData = await officesResponse.json();
        setOffices(officesData);

      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setUserRole(data.role); // Store user role
      } catch (error) {
        console.error("Error fetching user role:", error.message);
      }
    };

    fetchUserRole();
  }, []);

  // Add a new training title
  const handleAddTitle = async () => {
    if (!newTitle.trim()) {
      alert("Please enter a valid training title.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${API_BASE_URL}/training-titles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to add training title");
      }

      const addedTitle = await response.json();
      setTrainingTitles((prev) => [...prev, addedTitle]); // Update the list
      setNewTitle(""); // Clear the input
      alert("Training title added successfully!");
    } catch (error) {
      console.error("Error adding training title:", error.message);
      alert("Failed to add training title. Please try again.");
    }
  };

  // Automatically set author and office for "Member" role
  useEffect(() => {
    if (user?.role === "Member") {
      setFormData((prev) => ({
        ...prev,
        author: `${user.lastname}, ${user.firstname}`,
        office: user.office,
      }));
    }
  }, [user]);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "author") {
      const selectedAuthor = authors.find(
        (author) => `${user.lastname}, ${user.firstname}` === value
      );
      setFormData((prev) => ({
        ...prev,
        author: value,
        office: selectedAuthor ? selectedAuthor.office : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          certificate: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem("token"); // Ensure the user is authenticated
    if (!token) throw new Error("Authentication token not found");

    const response = await fetch(`${API_BASE_URL}/trainings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Failed to add training");

    const result = await response.json();
    alert("Training added successfully!");
    navigate("/trainings"); // Navigate to the list of trainings
  } catch (error) {
    console.error("Error submitting training:", error.message);
    alert("Failed to add training. Please try again.");
  }
};

  // Handle Add Office form submission
  const handleAddOffice = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!newOffice.trim()) {
      alert("Office name cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/offices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: newOffice }),
      });

      if (response.ok) {
        alert("Office added successfully.");
        setNewOffice(""); // Reset the form field after successful submission
      } else {
        const data = await response.json();
        alert(data.message || "Failed to add office.");
      }
    } catch (error) {
      console.error("Error adding office:", error.message);
      alert("An error occurred while adding the office.");
    }
  };

  return (
    <div>
      <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Add Training</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Title:</label>
            <select required name="title" value={formData.title} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
              <option value="" disabled>Select Training Title</option>
              {trainingTitles.map((title) => (
                <option key={title._id} value={title.name}>
                  {title.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Type:
            </label>
            <select
              required
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <option value="" disabled>
                Select type
              </option>
              <option value="Managerial">Managerial</option>
              <option value="Supervisory">Supervisory</option>
              <option value="Technical">Technical</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Start Date:
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              max={today}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>

          {/* End Date */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              End Date:
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              max={today}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>

          {/* Hours */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Hours:
            </label>
            <input
              type="number"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>

          {/* Sponsor */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Sponsor:
            </label>
            <input
              type="text"
              name="sponsor"
              value={formData.sponsor}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>

          {/* Author */}
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Author:</label>
            {user?.role === "Member" ? (
              <input type="text" name="author" value={formData.author} readOnly style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9" }} />
            ) : (
              <select required name="author" value={formData.author} onChange={handleChange} style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
                <option value="" disabled>Select Author</option>
                {authors.map((author) => (
                  <option key={author._id} value={`${user.lastname}, ${user.firstname}`}>
                    {author.lastname}, {author.firstname}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Office */}
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Office:</label>
            <input type="text" name="office" value={formData.office} readOnly style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px", backgroundColor: "#f9f9f9" }} />
          </div>

          {/* Certificate */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Certificate:
            </label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{
                display: "block",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="submit" style={{ backgroundColor: "#007BFF", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
              Add Training
            </button>
            <button type="button" onClick={() => navigate("/trainings")} style={{ backgroundColor: "#e74c3c", color: "#fff", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* CMS Section for Adding Titles (Visible to Superadmins only) */}
      {user?.role === "superadmin" && (
        <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", marginTop: "30px" }}>
          <h2>Add New Training Title</h2>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new training title"
            style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
          />
          <button onClick={handleAddTitle} style={{ padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Add Title
          </button>
        </div>
      )}

      {/* Add Office Section (Visible to Superadmins only) */}
      {user?.role === "superadmin" && (
        <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
          <h2>Add New Office</h2>
          <form onSubmit={handleAddOffice}>
            <div>
              <label htmlFor="officeName">Office Name</label>
              <input
                id="officeName"
                type="text"
                value={newOffice}
                onChange={(e) => setNewOffice(e.target.value)}
                placeholder="Enter office name"
                required
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
              />
            </div>
            <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#007BFF", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Add Office</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddTraining;
