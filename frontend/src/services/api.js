import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

api.interceptors.request.use(config => {
  const user = localStorage.getItem("medledger_user");
  if (user) {
    const { token } = JSON.parse(user);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function loginUser(payload) {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch {
    return { token: "demo-token" };
  }
}

export async function uploadRecord({ file, recordType, notes }) {
  const user = localStorage.getItem("medledger_user");
  const patientAddress = user ? JSON.parse(user).userId : "0x0000000000000000000000000000000000000000";
  const walletAddress = localStorage.getItem("medledger_wallet") || patientAddress;
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("recordType", recordType);
  formData.append("notes", notes);
  formData.append("patientAddress", walletAddress);
  
  const { data } = await api.post("/records/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}

export async function getPatientRecords() {
  try {
    const { data } = await api.get("/records/patient");
    return data;
  } catch {
    return [
      {
        id: "REC-1001",
        type: "Lab Result",
        date: "2026-02-15",
        doctor: "DR-9001",
        status: "Encrypted"
      },
      {
        id: "REC-1002",
        type: "Prescription",
        date: "2026-02-11",
        doctor: "DR-9001",
        status: "Shared"
      }
    ];
  }
}

export async function getDoctorRecords(patientId) {
  try {
    const user = localStorage.getItem("medledger_user");
    const doctorAddress = user ? JSON.parse(user).userId : "";
    const { data } = await api.get(`/records/doctor?patientAddress=${encodeURIComponent(patientId)}&doctorAddress=${encodeURIComponent(doctorAddress)}`);
    return data;
  } catch {
    return [
      {
        id: "REC-1001",
        patientId: patientId || "PT-1001",
        type: "Lab Result",
        uploadedAt: "2026-02-15",
        consent: true
      },
      {
        id: "REC-1043",
        patientId: patientId || "PT-1001",
        type: "Radiology",
        uploadedAt: "2026-02-18",
        consent: false
      }
    ];
  }
}

export async function getConsents() {
  try {
    const { data } = await api.get("/consents");
    return data;
  } catch {
    return [
      {
        id: "CON-1",
        doctorId: "DR-9001",
        scope: "All Records",
        enabled: true
      },
      {
        id: "CON-2",
        doctorId: "DR-9010",
        scope: "Lab Result",
        enabled: false
      }
    ];
  }
}

export async function setConsent(consentId, enabled) {
  try {
    const { data } = await api.patch(`/consents/${consentId}`, { enabled });
    return data;
  } catch {
    return { success: true };
  }
}

export async function predictHealthRisk(payload) {
  try {
    const formData = new FormData();
    formData.append("age", payload.age);
    formData.append("bmi", payload.bmi);
    formData.append("systolic_bp", payload.systolic_bp);
    formData.append("glucose", payload.glucose);
    formData.append("smoker", payload.smoker);
    formData.append("family_history", payload.family_history);

    if (payload.patientAddress) {
      formData.append("patientAddress", payload.patientAddress);
    }
    if (payload.doctorAddress) {
      formData.append("doctorAddress", payload.doctorAddress);
    }
    if (payload.analysisFile) {
      formData.append("analysisFile", payload.analysisFile);
    }

    const { data } = await api.post("/ai/predict-risk", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  } catch {
    return {
      risk_probability: 0.58,
      risk_level: "Moderate",
      model: "LogisticRegression",
      disease_prediction: "Cardiovascular Disease (CVD)",
      disease_confidence: 0.58,
      disease_candidates: [
        {
          disease: "Cardiovascular Disease (CVD)",
          score: 3,
          evidence: ["Demo fallback response"]
        }
      ],
      analysis_source: {
        records_considered: 0,
        uploaded_file_used: false,
        uploaded_file_name: null
      }
    };
  }
}

export async function requestEmergencyAccess(payload) {
  try {
    const { data } = await api.post("/emergency/request-access", payload);
    return data;
  } catch {
    return {
      message: "Emergency access requested (demo mode)",
      ticket: {
        _id: `ticket-${Date.now()}`,
        patientAddress: payload.patientAddress,
        doctorAddress: payload.doctorAddress,
        reason: payload.reason,
        durationMinutes: payload.durationMinutes || 30,
        expiresAt: new Date(Date.now() + (payload.durationMinutes || 30) * 60 * 1000).toISOString(),
        status: "active"
      }
    };
  }
}

export async function getEmergencyAccesses(patientAddress, doctorAddress) {
  try {
    const { data } = await api.get(
      `/emergency/active/${encodeURIComponent(patientAddress)}?doctorAddress=${encodeURIComponent(doctorAddress || "")}`
    );
    return data;
  } catch {
    return [];
  }
}

export async function getRiskAlerts(patientAddress, doctorAddress) {
  try {
    const { data } = await api.get(
      `/ai/alerts?patientAddress=${encodeURIComponent(patientAddress || "")}&doctorAddress=${encodeURIComponent(doctorAddress || "")}`
    );
    return data;
  } catch {
    return [];
  }
}
