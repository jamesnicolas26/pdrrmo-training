import { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://api.pdrrmo.bulacan.gov.ph";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Failed to send email." });
      } else {
        setMessage({ type: "success", text: "A reset link was sent to the email provided." });
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage({ type: "error", text: "Something went wrong. Please try again later." });
    }
  };

  return (
    <div style={{
      maxWidth: "400px",
      margin: "100px auto",
      padding: "30px",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
      fontFamily: "Arial, sans-serif"
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#2c3e50" }}>Forgot Password</h2>
      <form onSubmit={onSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="Enter your email"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#3498db",
            color: "#fff",
            fontSize: "16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send Reset Link
        </button>
      </form>
      {message && (
        <p
          style={{
            marginTop: "15px",
            color: message.type === "error" ? "red" : "green",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
