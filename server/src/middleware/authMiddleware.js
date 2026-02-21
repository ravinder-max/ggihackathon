import { verifyToken } from "../services/jwtService.js";
import { User } from "../models/User.js";

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid authorization header" });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = payload;
  req.userId = payload.userId;
  
  // Fetch user details for notifications
  try {
    const user = await User.findById(payload.userId);
    if (user) {
      req.userName = user.name || user.email || "User";
      req.walletAddress = user.walletAddress;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
  
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Required role: ${roles.join(" or ")}` });
    }

    next();
  };
}
