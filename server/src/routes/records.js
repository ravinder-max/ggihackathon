import { Router } from "express";
import multer from "multer";
import { ethers } from "ethers";
import { uploadToPinata } from "../services/pinataService.js";
import { writeRecordHashToChain } from "../services/blockchainService.js";
import { MedicalRecord } from "../models/MedicalRecord.js";
import { EmergencyAccess } from "../models/EmergencyAccess.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    let { patientAddress, doctorAddress, recordType, notes } = req.body;
    const file = req.file;

    if (!patientAddress) {
      patientAddress = "0x0000000000000000000000000000000000000000";
    }

    if (!ethers.isAddress(patientAddress)) {
      return res.status(400).json({ message: "Valid patientAddress is required" });
    }

    if (!file) {
      return res.status(400).json({ message: "Medical record file is required" });
    }

    const { ipfsHash, ipfsUrl } = await uploadToPinata(file.buffer, file.originalname, file.mimetype);
    const { chainHash, txHash } = await writeRecordHashToChain({ patientAddress, ipfsHash });

    const saved = await MedicalRecord.create({
      patientAddress,
      doctorAddress,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      ipfsHash,
      ipfsUrl,
      chainHash,
      txHash
    });

    return res.status(201).json({
      message: "Record uploaded and anchored successfully",
      recordId: saved._id,
      patientAddress: saved.patientAddress,
      ipfsHash: saved.ipfsHash,
      ipfsUrl: saved.ipfsUrl,
      chainHash: saved.chainHash,
      txHash: saved.txHash
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to upload medical record",
      error: error.message
    });
  }
});

router.get("/patient/:patientAddress", async (req, res) => {
  try {
    const { patientAddress } = req.params;
    const records = await MedicalRecord.find({ patientAddress: patientAddress.toLowerCase() }).sort({ createdAt: -1 });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch records", error: error.message });
  }
});

router.get("/doctor", async (req, res) => {
  try {
    const { patientAddress, doctorAddress } = req.query;

    if (!patientAddress) {
      return res.status(400).json({ message: "patientAddress is required" });
    }

    const records = await MedicalRecord.find({ patientAddress: String(patientAddress).toLowerCase() }).sort({ createdAt: -1 });

    let hasEmergencyAccess = false;
    if (doctorAddress && ethers.isAddress(String(doctorAddress))) {
      const activeTicket = await EmergencyAccess.findOne({
        patientAddress: String(patientAddress).toLowerCase(),
        doctorAddress: String(doctorAddress).toLowerCase(),
        status: "active",
        expiresAt: { $gt: new Date() }
      });
      hasEmergencyAccess = Boolean(activeTicket);
    }

    const mapped = records.map(record => {
      const assignedDoctorAccess =
        doctorAddress &&
        record.doctorAddress &&
        record.doctorAddress.toLowerCase() === String(doctorAddress).toLowerCase();

      const consent = Boolean(assignedDoctorAccess || hasEmergencyAccess);

      return {
        id: String(record._id),
        patientId: record.patientAddress,
        type: record.fileName,
        uploadedAt: record.createdAt,
        consent,
        accessMode: assignedDoctorAccess ? "Assigned" : hasEmergencyAccess ? "Emergency" : "Denied",
        ipfsHash: consent ? record.ipfsHash : undefined,
        ipfsUrl: consent ? record.ipfsUrl : undefined
      };
    });

    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch doctor records", error: error.message });
  }
});

export default router;
