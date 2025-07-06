import React from "react";

const MediaLibrary = ({ certificates, onSelect, onClose }) => {
  // Filter out duplicate URLs
  const uniqueCertificates = [...new Set(certificates)];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          maxWidth: 900,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Media Library</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {uniqueCertificates.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`Certificate ${idx + 1}`}
              style={{
                width: 150,
                height: 150,
                objectFit: "cover",
                borderRadius: 6,
                cursor: "pointer",
                border: "2px solid #eee",
              }}
              onClick={() => onSelect(src)}
            />
          ))}
        </div>
        <button
          style={{
            marginTop: 20,
            padding: "8px 16px",
            borderRadius: 4,
            border: "none",
            background: "#4CAF50",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MediaLibrary;
