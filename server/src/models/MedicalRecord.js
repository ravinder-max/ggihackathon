import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patientAddress: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    doctorAddress: {
      type: String,
      required: false,
      lowercase: true
    },
    fileName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    ipfsHash: {
      type: String,
      required: true,
      index: true
    },
    ipfsUrl: {
      type: String,
      required: true
    },
    chainHash: {
      type: String,
      required: true
    },
    txHash: {
      type: String,
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
