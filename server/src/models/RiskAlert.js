import mongoose from "mongoose";

const riskAlertSchema = new mongoose.Schema(
  {
    patientAddress: {
      type: String,
      lowercase: true,
      index: true
    },
    doctorAddress: {
      type: String,
      lowercase: true,
      index: true
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ["Low", "Moderate", "High"]
    },
    probability: {
      type: Number,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    payload: {
      type: Object,
      required: true
    }
  },
  { timestamps: true }
);

export const RiskAlert = mongoose.model("RiskAlert", riskAlertSchema);
