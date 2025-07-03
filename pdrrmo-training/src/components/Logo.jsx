import React from "react";

export default function Logo() {
  return (
    <img
      src={`${process.env.PUBLIC_URL}images/pdrrmo-logo.png`}
      alt="PDRRMO Logo"
      style={{
        width: "120px",
        height: "120px",
        objectFit: "contain",
      }}
    />
  );
}
