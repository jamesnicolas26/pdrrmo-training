// src/pages/EditTraining.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

const EditTraining = () => {
  const { id } = useParams();
  const navigate = useNavigate();

const [trainingTitles, setTrainingTitles] = useState([]);
const [newTitle, setNewTitle] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    startDate: "",
    endDate: "",
    hours: "",
    sponsor: "",
    author: "",
    office: "",
    certificate: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!id) {
      setError("No training ID in the URL");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/trainings/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setFormData(data);
      } catch (err) {
        console.error(err);
        setError("Could not load training record");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
  const fetchTrainingTitles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/training-titles`);
      if (!res.ok) throw new Error("Failed to fetch training titles");
      const titles = await res.json();
      setTrainingTitles(titles);
    } catch (error) {
      console.error("Error loading titles:", error);
    }
  };
  fetchTrainingTitles();
  }, []);

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) { // 2MB
      alert("File size exceeds 2MB. Please upload a smaller file.");
      return;
    }

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

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/trainings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Training updated!");
      navigate("/trainings");
    } catch (err) {
      alert("Update failed, try again");
      console.error(err);
    }
  };

  if (loading)
    return <p style={{ textAlign: "center" }}>Loading…</p>;
  if (error)
    return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

  return (
    <div style={{
      maxWidth: "600px",
      margin: "20px auto",
      padding: "50px 50px",
      border: "1px solid #ccc",
      borderRadius: "10px",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)"
    }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Edit Training</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* Title Dropdown */}
        <div>
          <label style={labelStyle}>Title:</label>
          <select
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}
          >
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
          <label style={labelStyle}>Type:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Choose…</option>
            <option value="Managerial">Managerial</option>
            <option value="Supervisory">Supervisory</option>
            <option value="Technical">Technical</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label style={labelStyle}>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate?.substring(0, 10) || ""}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* End Date */}
        <div>
          <label style={labelStyle}>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate?.substring(0, 10) || ""}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Hours */}
        <div>
          <label style={labelStyle}>Hours:</label>
          <input
            type="number"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Sponsor */}
        <div>
          <label style={labelStyle}>Sponsor:</label>
          <input
            name="sponsor"
            value={formData.sponsor}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Author */}
        <div>
          <label style={labelStyle}>Author:</label>
          <input
            name="author"
            value={formData.author}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Office */}
        <div>
          <label style={labelStyle}>Office:</label>
          <input
            name="office"
            value={formData.office}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Certificate Preview */}
        {formData.certificate && (
          <div>
            <label style={labelStyle}>Existing Certificate Preview:</label>
            {formData.certificate.includes("pdf") ? (
              <a href={formData.certificate} target="_blank" rel="noreferrer">
              </a>
            ) : (
              <img src={formData.certificate} alt="Certificate" style={{ maxWidth: "100%", marginBottom: "10px" }} />
            )}
          </div>
        )}

        {/* Certificate Upload */}
        <div>
          <label style={labelStyle}>Replace Certificate:</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "block" }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#007BFF",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Update Training
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: "#e74c3c",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────── Shared styles
const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

export default EditTraining;
