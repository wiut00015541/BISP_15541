// jwt holds shared backend helpers used across the app.
const jwt = require("jsonwebtoken");

// Keep generate token reusable across the backend.
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
  generateToken,
  verifyToken,
};
