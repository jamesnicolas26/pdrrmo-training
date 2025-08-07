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
          const sortedOffices = (data.offices || []).sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setOffices(sortedOffices);
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
    maxWidth: "900px",               // optionally increased width
    margin: "40px auto",             // adds margin at top and bottom
    padding: "50px 50px",                 // increased padding inside the card
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    gap: "20px",
  };

  const labelStyle = {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",           // more inner spacing
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "5px",            // reduced to avoid extra spacing inside grid
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
    gap: "24px",                     // wider spacing between fields
    gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))", // more responsive width
    marginBottom: "30px",           // more space before next group
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
              <option value="" disabled>Select Title</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Atty.">Atty.</option>
              <option value="Dr.">Dr.</option>
              <option value="Engr.">Engr.</option>
              <option value="P/Lt. Col.">P/Lt. Col.</option>
              <option value="Rev. Fr.">Rev. Fr.</option>
              <option value="FSSupt.">FSSupt.</option>
              <option value="P/Col.">P/Col.</option>
              <option value="Sr.">Sr.</option>
              <option value="Kap.">Kap.</option>
              <option value="Lt. Col.">Lt. Col.</option>
              <option value="PD">PD</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
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

          <div style={{ flex: 1 }}>
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

          <div style={{ flex: 1 }}>
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

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>
              Office {isFieldEmpty("office") && <span style={{ color: "red" }}>*</span>}
            </label>
            <select
              name="office"
              value={formData.office}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="" disabled>Select Office</option>
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

          <div style={{ flex: 1 }}>
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

          <div style={{ flex: 1 }}>
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

          <div style={{ flex: 1 }}>
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

          <div style={{ flex: 1 }}>
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
