import { Router } from "express";
import multer from "multer";
import { predictHealthRisk } from "../services/aiService.js";
import { RiskAlert } from "../models/RiskAlert.js";
import { MedicalRecord } from "../models/MedicalRecord.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const diseaseRules = [
  {
    key: "cardiovascular_disease",
    label: "Cardiovascular Disease (CVD)",
    keywords: ["heart", "cardio", "ecg", "hypertension", "bp", "coronary", "chest pain"]
  },
  {
    key: "type_2_diabetes",
    label: "Type 2 Diabetes",
    keywords: ["diabetes", "glucose", "hba1c", "insulin", "sugar"]
  },
  {
    key: "chronic_kidney_disease",
    label: "Chronic Kidney Disease (CKD)",
    keywords: ["kidney", "renal", "creatinine", "egfr", "urea"]
  },
  {
    key: "chronic_respiratory_disease",
    label: "Chronic Respiratory Disease",
    keywords: ["lung", "respiratory", "asthma", "copd", "spo2", "xray chest"]
  },
  {
    key: "liver_disease",
    label: "Liver Disease",
    keywords: ["liver", "hepatic", "bilirubin", "sgpt", "sgot", "alt", "ast"]
  }
];

function parsePayload(body) {
  const payload = {
    age: Number(body.age),
    bmi: Number(body.bmi),
    systolic_bp: Number(body.systolic_bp),
    glucose: Number(body.glucose),
    smoker: Number(body.smoker),
    family_history: Number(body.family_history)
  };

  if (Object.values(payload).some(value => Number.isNaN(value))) {
    return { error: "All risk feature fields must be numeric values." };
  }

  return { payload };
}

function getAnalysisText(file) {
  if (!file?.buffer) {
    return "";
  }

  const fileName = String(file.originalname || "").toLowerCase();
  const mimeType = String(file.mimetype || "").toLowerCase();
  const isLikelyText =
    mimeType.startsWith("text/") ||
    mimeType.includes("json") ||
    mimeType.includes("csv") ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".csv") ||
    fileName.endsWith(".json") ||
    fileName.endsWith(".md");

  if (!isLikelyText) {
    return fileName;
  }

  try {
    return `${fileName} ${file.buffer.toString("utf8", 0, Math.min(file.buffer.length, 12000))}`.toLowerCase();
  } catch {
    return fileName;
  }
}

function inferDiseases({ payload, prediction, records, file }) {
  const scores = diseaseRules.map(rule => ({
    key: rule.key,
    label: rule.label,
    score: 0,
    evidence: []
  }));

  const indexByKey = Object.fromEntries(scores.map(item => [item.key, item]));

  indexByKey.cardiovascular_disease.score += 2;
  indexByKey.cardiovascular_disease.evidence.push("Base cardiometabolic model output");

  if (payload.systolic_bp >= 140) {
    indexByKey.cardiovascular_disease.score += 2;
    indexByKey.cardiovascular_disease.evidence.push("High systolic blood pressure");
  }
  if (payload.glucose >= 126) {
    indexByKey.type_2_diabetes.score += 2;
    indexByKey.type_2_diabetes.evidence.push("High glucose value");
  }
  if (payload.bmi >= 30) {
    indexByKey.cardiovascular_disease.score += 1;
    indexByKey.type_2_diabetes.score += 1;
    indexByKey.cardiovascular_disease.evidence.push("High BMI");
    indexByKey.type_2_diabetes.evidence.push("High BMI");
  }
  if (payload.smoker === 1) {
    indexByKey.cardiovascular_disease.score += 1;
    indexByKey.chronic_respiratory_disease.score += 2;
    indexByKey.cardiovascular_disease.evidence.push("Smoking status positive");
    indexByKey.chronic_respiratory_disease.evidence.push("Smoking status positive");
  }
  if (payload.family_history === 1) {
    indexByKey.cardiovascular_disease.score += 1;
    indexByKey.type_2_diabetes.score += 1;
    indexByKey.cardiovascular_disease.evidence.push("Family history present");
    indexByKey.type_2_diabetes.evidence.push("Family history present");
  }

  const recordText = records
    .map(record => `${record.fileName || ""} ${record.mimeType || ""}`)
    .join(" ")
    .toLowerCase();
  const fileText = getAnalysisText(file);
  const combinedText = `${recordText} ${fileText}`;

  diseaseRules.forEach(rule => {
    const matched = rule.keywords.filter(keyword => combinedText.includes(keyword));
    if (matched.length > 0) {
      const target = indexByKey[rule.key];
      target.score += Math.min(3, matched.length);
      target.evidence.push(`Matched medical terms: ${matched.slice(0, 4).join(", ")}`);
    }
  });

  if (prediction.risk_level === "High") {
    indexByKey.cardiovascular_disease.score += 1;
    indexByKey.type_2_diabetes.score += 1;
  }

  const ranked = scores.sort((a, b) => b.score - a.score).filter(item => item.score > 0);
  const primary = ranked[0] || {
    key: "cardiovascular_disease",
    label: "Cardiovascular Disease (CVD)",
    score: 1,
    evidence: ["Default disease focus from cardiometabolic model"]
  };

  return {
    disease_prediction: primary.label,
    disease_confidence: prediction.risk_probability,
    disease_candidates: ranked.slice(0, 3).map(item => ({
      disease: item.label,
      score: item.score,
      evidence: item.evidence.slice(0, 3)
    })),
    analysis_source: {
      records_considered: records.length,
      uploaded_file_used: Boolean(file),
      uploaded_file_name: file?.originalname || null
    }
  };
}

router.post("/predict-risk", upload.single("analysisFile"), async (req, res) => {
  try {
    const { patientAddress, doctorAddress } = req.body;
    const { payload, error } = parsePayload(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const prediction = await predictHealthRisk(payload);

    let patientRecords = [];
    if (patientAddress) {
      patientRecords = await MedicalRecord.find({
        patientAddress: String(patientAddress).toLowerCase()
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .select("fileName mimeType createdAt");
    }

    const diseaseInsights = inferDiseases({
      payload,
      prediction,
      records: patientRecords,
      file: req.file
    });

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

    return res.json({
      ...prediction,
      ...diseaseInsights
    });
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
