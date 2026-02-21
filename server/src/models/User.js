import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true
    },
    password: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["patient", "doctor"],
      required: true
    },
    walletAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    specialization: {
      type: String,
      required: false
    },
    licenseNumber: {
      type: String,
      required: false
    },
    hospital: {
      type: String,
      required: false
    },
    age: {
      type: Number,
      required: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
