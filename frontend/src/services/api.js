import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("medledger_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginUser(email, password) {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("medledger_token", data.token);
      localStorage.setItem("medledger_user", JSON.stringify(data.user));
      localStorage.setItem("medledger_wallet", data.user.walletAddress);
    }
    return data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
}

export async function registerUser(userData) {
  const { data } = await api.post("/auth/register", userData);
  if (data.token) {
    localStorage.setItem("medledger_token", data.token);
    localStorage.setItem("medledger_user", JSON.stringify(data.user));
    localStorage.setItem("medledger_wallet", data.user.walletAddress);
  }
  return data;
}

export async function getCurrentUser() {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  localStorage.removeItem("medledger_token");
  localStorage.removeItem("medledger_user");
  localStorage.removeItem("medledger_wallet");
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
    const walletAddress = localStorage.getItem("medledger_wallet");
    if (!walletAddress) {
      throw new Error("No wallet address found");
    }
    const { data } = await api.get(`/records/patient/${encodeURIComponent(walletAddress)}`);
    // Backend returns array directly, wrap it for consistency
    return { records: data };
  } catch (error) {
    console.error("getPatientRecords error:", error);
    return { records: [] };
  }
}

export async function getDoctorRecords(patientId) {
  try {
    const user = localStorage.getItem("medledger_user");
    const doctorAddress = user ? JSON.parse(user).walletAddress : "";
    console.log("Fetching doctor records for patient:", patientId, "doctor:", doctorAddress);
    const { data } = await api.get(`/records/doctor?patientAddress=${encodeURIComponent(patientId)}&doctorAddress=${encodeURIComponent(doctorAddress)}`);
    console.log("Doctor records response:", data);
    return data;
  } catch (error) {
    console.error("getDoctorRecords error:", error);
    return [];
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
    const user = localStorage.getItem("medledger_user");
    const docAddress = doctorAddress || (user ? JSON.parse(user).walletAddress : "");
    const { data } = await api.get(
      `/emergency/active/${encodeURIComponent(patientAddress)}?doctorAddress=${encodeURIComponent(docAddress)}`
    );
    return data;
  } catch {
    return [];
  }
}

export async function getRiskAlerts(patientAddress, doctorAddress) {
  try {
    const user = localStorage.getItem("medledger_user");
    const docAddress = doctorAddress || (user ? JSON.parse(user).walletAddress : "");
    const { data } = await api.get(
      `/ai/alerts?patientAddress=${encodeURIComponent(patientAddress || "")}&doctorAddress=${encodeURIComponent(docAddress)}`
    );
    return data;
  } catch {
    return [];
  }
}

export async function predictDiabetes(payload) {
  try {
    const { data } = await api.post("/ai/predict-diabetes", payload);
    return data;
  } catch {
    // Return mock data for demo
    return {
      prediction: "Negative",
      probability: 0.23,
      message: "Low risk of diabetes"
    };
  }
}

export async function predictHeartDisease(payload) {
  try {
    const { data } = await api.post("/ai/predict-heart", payload);
    return data;
  } catch {
    // Return mock data for demo
    return {
      prediction: "Negative",
      probability: 0.15,
      message: "Low risk of heart disease"
    };
  }
}
