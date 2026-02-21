import { Router } from "express";
import multer from "multer";
import { ethers } from "ethers";
import { uploadToPinata } from "../services/pinataService.js";
import { writeRecordHashToChain } from "../services/blockchainService.js";
import { MedicalRecord } from "../models/MedicalRecord.js";
import { EmergencyAccess } from "../models/EmergencyAccess.js";
import { User } from "../models/User.js";

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

    // Get Socket.IO instance
    const io = req.app.get("io");
    
    // Emit real-time notification to the patient
    io.to(`user:${req.userId}`).emit("record:created", {
      recordId: saved._id,
      fileName: saved.fileName,
      patientAddress: saved.patientAddress,
      createdAt: saved.createdAt,
      message: `New record "${saved.fileName}" uploaded successfully`
    });

    // If a doctor is assigned, notify them
    if (doctorAddress && ethers.isAddress(doctorAddress)) {
      // Find doctor's user ID
      const doctor = await User.findOne({ walletAddress: doctorAddress.toLowerCase() });
      if (doctor) {
        io.to(`user:${doctor._id.toString()}`).emit("record:new", {
          recordId: saved._id,
          fileName: saved.fileName,
          patientAddress: saved.patientAddress,
          patientName: req.userName || "Patient",
          createdAt: saved.createdAt,
          message: `New record from patient: "${saved.fileName}"`
        });
      }
    }

    // Notify all doctors who have emergency access to this patient
    const activeEmergencyAccess = await EmergencyAccess.find({
      patientAddress: patientAddress.toLowerCase(),
      status: "active",
      expiresAt: { $gt: new Date() }
    });

    for (const access of activeEmergencyAccess) {
      const emergencyDoctor = await User.findOne({ walletAddress: access.doctorAddress.toLowerCase() });
      if (emergencyDoctor) {
        io.to(`user:${emergencyDoctor._id.toString()}`).emit("record:new", {
          recordId: saved._id,
          fileName: saved.fileName,
          patientAddress: saved.patientAddress,
          patientName: req.userName || "Patient",
          accessType: "emergency",
          createdAt: saved.createdAt,
          message: `New record from patient (Emergency Access): "${saved.fileName}"`
        });
      }
    }

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
    
    // Fetch doctor details for each record
    const doctorAddresses = [...new Set(records.map(r => r.doctorAddress).filter(Boolean))];
    const doctors = await User.find({ walletAddress: { $in: doctorAddresses.map(a => a.toLowerCase()) } });
    const doctorMap = Object.fromEntries(doctors.map(d => [d.walletAddress.toLowerCase(), d.fullName]));
    
    const mapped = records.map(record => ({
      id: String(record._id),
      fileName: record.fileName,
      title: record.fileName,
      type: record.fileName?.split('.').pop()?.toUpperCase() || 'Unknown',
      recordType: record.fileName?.includes('Prescription') ? 'Prescription' : 
                  record.fileName?.includes('Lab') ? 'Lab Result' :
                  record.fileName?.includes('XRay') || record.fileName?.includes('MRI') ? 'Radiology' :
                  record.fileName?.includes('Discharge') ? 'Discharge Summary' : 'Medical Record',
      date: new Date(record.createdAt).toLocaleDateString(),
      createdAt: record.createdAt,
      doctor: doctorMap[record.doctorAddress?.toLowerCase()] || 'Unknown',
      doctorAddress: record.doctorAddress,
      ipfsHash: record.ipfsHash,
      ipfsUrl: record.ipfsUrl,
      status: 'Uploaded'
    }));
    
    return res.json(mapped);
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

    // Fetch doctor details for each record
    const doctorAddresses = [...new Set(records.map(r => r.doctorAddress).filter(Boolean))];
    const doctors = await User.find({ walletAddress: { $in: doctorAddresses.map(a => a.toLowerCase()) } });
    const doctorMap = Object.fromEntries(doctors.map(d => [d.walletAddress.toLowerCase(), d.fullName]));

    const mapped = records.map(record => {
      const assignedDoctorAccess =
        doctorAddress &&
        record.doctorAddress &&
        record.doctorAddress.toLowerCase() === String(doctorAddress).toLowerCase();

      const consent = Boolean(assignedDoctorAccess || hasEmergencyAccess);

      return {
        id: String(record._id),
        patientId: record.patientAddress,
        fileName: record.fileName,
        type: record.fileName?.split('.').pop()?.toUpperCase() || 'Unknown',
        recordType: record.fileName?.includes('Prescription') ? 'Prescription' : 
                    record.fileName?.includes('Lab') ? 'Lab Result' :
                    record.fileName?.includes('XRay') || record.fileName?.includes('MRI') ? 'Radiology' :
                    record.fileName?.includes('Discharge') ? 'Discharge Summary' : 'Medical Record',
        uploadedAt: record.createdAt,
        date: new Date(record.createdAt).toLocaleDateString(),
        consent,
        accessMode: assignedDoctorAccess ? "Assigned" : hasEmergencyAccess ? "Emergency" : "Denied",
        ipfsHash: consent ? record.ipfsHash : undefined,
        ipfsUrl: consent ? record.ipfsUrl : undefined,
        doctor: doctorMap[record.doctorAddress?.toLowerCase()] || 'Unknown',
        doctorAddress: record.doctorAddress
      };
    });

    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch doctor records", error: error.message });
  }
});

export default router;
