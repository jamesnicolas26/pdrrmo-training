const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secretKey = process.env.SECRET_KEY || "your-secret-key";
  const token = jwt.sign(
    { id: userId }, // Payload
    secretKey, // Secret key
    { expiresIn: "1h" } // Options: Set expiration time
  );

  return token;
};

module.exports = { generateToken };
