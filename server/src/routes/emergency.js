import { Router } from "express";
import { ethers } from "ethers";
import { EmergencyAccess } from "../models/EmergencyAccess.js";

const router = Router();

router.post("/request-access", async (req, res) => {
  try {
    const { patientAddress, doctorAddress, reason, durationMinutes = 30 } = req.body;

    if (!patientAddress || !ethers.isAddress(patientAddress)) {
      return res.status(400).json({ message: "Valid patientAddress is required" });
    }

    if (!doctorAddress || !ethers.isAddress(doctorAddress)) {
      return res.status(400).json({ message: "Valid doctorAddress is required" });
    }

    if (!reason || reason.trim().length < 6) {
      return res.status(400).json({ message: "Emergency reason is required (min 6 chars)" });
    }

    const expiresAt = new Date(Date.now() + Number(durationMinutes) * 60 * 1000);

    const ticket = await EmergencyAccess.create({
      patientAddress,
      doctorAddress,
      reason,
      durationMinutes: Number(durationMinutes),
      expiresAt,
      status: "active"
    });

    return res.status(201).json({
      message: "Emergency access granted temporarily",
      ticket
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to request emergency access", error: error.message });
  }
});

router.get("/active/:patientAddress", async (req, res) => {
  try {
    const { patientAddress } = req.params;
    const { doctorAddress } = req.query;

    const query = {
      patientAddress: patientAddress.toLowerCase(),
      status: "active",
      expiresAt: { $gt: new Date() }
    };

    if (doctorAddress) {
      query.doctorAddress = String(doctorAddress).toLowerCase();
    }

    const active = await EmergencyAccess.find(query).sort({ createdAt: -1 });
    return res.json(active);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch active emergency access", error: error.message });
  }
});

router.post("/close/:id", async (req, res) => {
  try {
    const closed = await EmergencyAccess.findByIdAndUpdate(
      req.params.id,
      { status: "closed" },
      { new: true }
    );

    if (!closed) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.json({ message: "Emergency access closed", ticket: closed });
  } catch (error) {
    return res.status(500).json({ message: "Failed to close emergency access", error: error.message });
  }
});

export default router;
