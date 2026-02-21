import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import User model from correct path
import { User } from "../src/models/User.js";

dotenv.config();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const SEED_USERS = [
  // Patients
  {
    email: "patient1@medledger.com",
    password: "Patient@123",
    fullName: "Rajesh Kumar",
    role: "patient",
    walletAddress: "0x1234567890123456789012345678901234567890",
    age: 45
  },
  {
    email: "patient2@medledger.com",
    password: "Patient@123",
    fullName: "Priya Singh",
    role: "patient",
    walletAddress: "0x2345678901234567890123456789012345678901",
    age: 52
  },
  {
    email: "patient3@medledger.com",
    password: "Patient@123",
    fullName: "Amit Patel",
    role: "patient",
    walletAddress: "0x3456789012345678901234567890123456789012",
    age: 38
  },
  {
    email: "patient4@medledger.com",
    password: "Patient@123",
    fullName: "Deepa Sharma",
    role: "patient",
    walletAddress: "0x4567890123456789012345678901234567890123",
    age: 48
  },
  // Doctors
  {
    email: "doctor1@medledger.com",
    password: "Doctor@123",
    fullName: "Dr. Mohit Verma",
    role: "doctor",
    walletAddress: "0x5678901234567890123456789012345678901234",
    specialization: "Cardiology",
    licenseNumber: "MCI-DC-2020-001",
    hospital: "Max Healthcare Delhi"
  },
  {
    email: "doctor2@medledger.com",
    password: "Doctor@123",
    fullName: "Dr. Sneha Gupta",
    role: "doctor",
    walletAddress: "0x6789012345678901234567890123456789012345",
    specialization: "Endocrinology",
    licenseNumber: "MCI-DC-2019-002",
    hospital: "Apollo Hospitals Mumbai"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medledger");
    console.log("Connected to MongoDB");

    // Check if data already exists
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} users. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    const users = await User.insertMany(
      SEED_USERS.map(user => ({
        ...user,
        password: hashPassword(user.password)
      }))
    );

    console.log("\n✅ Database seeded successfully!\n");
    console.log("--- PATIENTS (Login Credentials) ---");
    SEED_USERS.filter(u => u.role === "patient").forEach(user => {
      console.log(`\nName: ${user.fullName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Wallet: ${user.walletAddress}`);
    });

    console.log("\n--- DOCTORS (Login Credentials) ---");
    SEED_USERS.filter(u => u.role === "doctor").forEach(user => {
      console.log(`\nName: ${user.fullName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Wallet: ${user.walletAddress}`);
      console.log(`Specialization: ${user.specialization}`);
      console.log(`Hospital: ${user.hospital}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();
