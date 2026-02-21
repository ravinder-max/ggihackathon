import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "medledger-secret-key-change-in-production";
const TOKEN_EXPIRY = "7d";

export function generateToken(userId, email, role, walletAddress) {
  return jwt.sign(
    {
      userId,
      email,
      role,
      walletAddress
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}
