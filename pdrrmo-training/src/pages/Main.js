import React from "react";

function Main() {
  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f3f4f6",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
    <br />
    <br />
    <br />
      {/* Logo Section */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
    <img
      // src={`${process.env.PUBLIC_URL}/pdrrmo-logo.png`}
      src={`/pdrrmo-logo.png`}
      alt="PDRRMO Logo"
      style={{
        width: "150px",
        height: "150px",
        objectFit: "cover", // Ensures it fills the box without distortion
        borderRadius: "5px" // Optional: soft corners like photo prints
      }}
    />

      </div>

      <h1
        style={{
          fontSize: "2.5rem",
          color: "#1e3a8a",
          marginBottom: "20px",
        }}
      >
        Welcome to PDRRMO Trainings Portal
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#374151", marginBottom: "30px" }}>
        Manage training, users, and other disaster preparedness resources.
      </p>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "#1e3a8a", marginBottom: "15px" }}>
          Our Mission
        </h2>
        <p style={{ fontSize: "1rem", color: "#374151", lineHeight: "1.5" }}>
          At PDRRMO, we are committed to ensuring the safety and resilience of our communities
          through education, training, and disaster risk management. Together, we build a
          disaster-ready Bulacan.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#e5e7eb",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", color: "#1e3a8a", marginBottom: "15px" }}>
          Latest Updates
        </h2>
        <ul style={{ listStyle: "none", padding: 0, color: "#374151" }}>
          <li> Typhoon Preparedness Training - March 15, 2025</li>
          <li> Earthquake Drill Report - March 12, 2025</li>
          <li> New Emergency Hotlines Announced</li>
        </ul>
      </div>

      <footer style={{ marginTop: "40px", color: "#6b7280", fontSize: "0.9rem" }}>
        <p>
          Disaster risk management is about understanding, preparing for, and mitigating potential risks.
        </p>
        <p>Learn, adapt, and collaborate to make our communities more resilient.</p>
        <p style={{ marginTop: "20px" }}>© {new Date().getFullYear()} PDRRMO Bulacan. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Main;
