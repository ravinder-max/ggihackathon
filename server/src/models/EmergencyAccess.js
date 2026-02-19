import mongoose from "mongoose";

const emergencyAccessSchema = new mongoose.Schema(
  {
    patientAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    doctorAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    reason: {
      type: String,
      required: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["active", "closed", "expired"],
      default: "active",
      index: true
    }
  },
  { timestamps: true }
);

export const EmergencyAccess = mongoose.model("EmergencyAccess", emergencyAccessSchema);
