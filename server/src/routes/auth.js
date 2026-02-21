import { Router } from "express";
import crypto from "crypto";
import { User } from "../models/User.js";
import { generateToken, verifyToken } from "../services/jwtService.js";

const router = Router();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function comparePassword(plain, hashed) {
  return hashPassword(plain) === hashed;
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, role, walletAddress, specialization, licenseNumber, hospital, age } = req.body;

    if (!email || !password || !fullName || !role || !walletAddress) {
      return res.status(400).json({ message: "Missing required fields: email, password, fullName, role, walletAddress" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashPassword(password),
      fullName,
      role,
      walletAddress: walletAddress.toLowerCase(),
      specialization,
      licenseNumber,
      hospital,
      age
    });

    const token = generateToken(String(user._id), user.email, user.role, user.walletAddress);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(String(user._id), user.email, user.role, user.walletAddress);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        hospital: user.hospital,
        age: user.age
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid authorization header" });
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: String(user._id),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress,
        specialization: user.specialization,
        licenseNumber: user.licenseNumber,
        hospital: user.hospital,
        age: user.age
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

export default router;
