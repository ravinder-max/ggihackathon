import { Router } from "express";
import { predictHealthRisk } from "../services/aiService.js";
import { RiskAlert } from "../models/RiskAlert.js";

const router = Router();

router.post("/predict-risk", async (req, res) => {
  try {
    const { age, bmi, systolic_bp, glucose, smoker, family_history, patientAddress, doctorAddress } = req.body;

    const payload = {
      age: Number(age),
      bmi: Number(bmi),
      systolic_bp: Number(systolic_bp),
      glucose: Number(glucose),
      smoker: Number(smoker),
      family_history: Number(family_history)
    };

    if (Object.values(payload).some(value => Number.isNaN(value))) {
      return res.status(400).json({ message: "All risk feature fields must be numeric values." });
    }

    const prediction = await predictHealthRisk(payload);

    if (prediction.risk_level === "High") {
      await RiskAlert.create({
        patientAddress: patientAddress ? String(patientAddress).toLowerCase() : undefined,
        doctorAddress: doctorAddress ? String(doctorAddress).toLowerCase() : undefined,
        riskLevel: prediction.risk_level,
        probability: Number(prediction.risk_probability),
        model: prediction.model,
        payload
      });
    }

    return res.json(prediction);
  } catch (error) {
    return res.status(500).json({
      message: "Risk prediction failed",
      error: error.message
    });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const { patientAddress, doctorAddress } = req.query;
    const query = {};

    if (patientAddress) {
      query.patientAddress = String(patientAddress).toLowerCase();
    }
    if (doctorAddress) {
      query.doctorAddress = String(doctorAddress).toLowerCase();
    }

    const alerts = await RiskAlert.find(query).sort({ createdAt: -1 }).limit(50);
    return res.json(alerts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch risk alerts", error: error.message });
  }
});

export default router;
