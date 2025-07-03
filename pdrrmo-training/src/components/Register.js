import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    lastname: "",
    firstname: "",
    middlename: "",
    office: "",
    email: "",            // ✅ added
    username: "",
    role: "Member",
    password: "",
    confirmPassword: "",
  });


  const [offices, setOffices] = useState([]); // Make sure it's initialized as an empty array
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/offices`);
        const data = await response.json();
        setOffices(data.offices || []); // Safely set an empty array if no offices data
      } catch (error) {
        console.error("Error fetching offices:", error.message);
      }
    };

    fetchOffices();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFieldEmpty = (field) => !formData[field];

  const validateForm = () => {
    const {
      title,
      lastname,
      firstname,
      office,
      email,
      username,
      role,
      password,
      confirmPassword,
    } = formData;

    if (
      !title ||
      !lastname ||
      !firstname ||
      !office ||
      !email ||
      !username ||
      !role ||
      !password ||
      !confirmPassword
    ) {
      alert("All fields are required.");
      return false;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("User registered successfully!");
        setFormData({
          title: "",
          lastname: "",
          firstname: "",
          middlename: "",
          office: "",
          email: "",
          username: "",
          role: "",
          password: "",
          confirmPassword: "",
        });
        navigate("/signin");
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
      console.error("Error during registration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: "800px",
  margin: "0 auto",
  padding: "20px",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  marginTop: "100px", // Add this line for space before the form
  };

  const labelStyle = {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "10px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    backgroundColor: isLoading ? "#6c757d" : "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: isLoading ? "not-allowed" : "pointer",
  };

  const gridStyle = {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    marginBottom: "20px",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Register User</h1>
      <form onSubmit={handleSubmit}>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>
              Title {isFieldEmpty("title") && <span style={{ color: "red" }}>*</span>}
            </label>
            <select
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select Title</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Last Name {isFieldEmpty("lastname") && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label style={labelStyle}>
              First Name {isFieldEmpty("firstname") && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label style={labelStyle}>Middle Name (Optional)</label>
            <input
              type="text"
              name="middlename"
              value={formData.middlename}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter your middle name"
            />
          </div>

          <div>
            <label style={labelStyle}>
              Office {isFieldEmpty("office") && <span style={{ color: "red" }}>*</span>}
            </label>
            <select
              name="office"
              value={formData.office}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">Select Office</option>
              {offices.length > 0 ? (
                offices.map((office, index) => (
                  <option key={index} value={office.name}>
                    {office.name}
                  </option>
                ))
              ) : (
                <option value="">No offices available</option>
              )}
            </select>
          </div>
        </div>

        <div style={gridStyle}>

          <div>
            <label style={labelStyle}>
              Username {isFieldEmpty("username") && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label style={labelStyle}>
              Email {isFieldEmpty("email") && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label style={labelStyle}>
              Password {isFieldEmpty("password") && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label style={labelStyle}>
              Confirm Password {isFieldEmpty("confirmPassword") && <span style={{ color: "red" }}>*</span>}
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Re-enter your password"
            />
          </div>
        </div>

        <div style={{ textAlign: "left" }}>
          <p>
            Already have an account? <Link to="/signin">Login</Link>
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
