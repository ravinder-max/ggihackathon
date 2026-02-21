import mongoose from "mongoose";
import crypto from "crypto";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Same hash function used in auth.js
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from parent directory
config({ path: join(__dirname, "../.env") });

// Import models
import { User } from "../src/models/User.js";
import { MedicalRecord } from "../src/models/MedicalRecord.js";
import { EmergencyAccess } from "../src/models/EmergencyAccess.js";
import { RiskAlert } from "../src/models/RiskAlert.js";

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/medledger";

// Fake Data Generators
const generateWalletAddress = () => {
  return "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
};

const generateIPFSHash = () => {
  return "Qm" + Array(44).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
};

const generateTxHash = () => {
  return "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");
};

// Sample Data
const doctorsData = [
  {
    fullName: "Dr. Sarah Johnson",
    email: "sarah.johnson@medledger.com",
    password: "doctor123",
    role: "doctor",
    specialization: "Cardiology",
    licenseNumber: "MD-2024-001"
  },
  {
    fullName: "Dr. Michael Chen",
    email: "michael.chen@medledger.com",
    password: "doctor123",
    role: "doctor",
    specialization: "Internal Medicine",
    licenseNumber: "MD-2024-002"
  },
  {
    fullName: "Dr. Emily Roberts",
    email: "emily.roberts@medledger.com",
    password: "doctor123",
    role: "doctor",
    specialization: "Radiology",
    licenseNumber: "MD-2024-003"
  }
];

const patientsData = [
  {
    fullName: "John Smith",
    email: "john.smith@email.com",
    password: "patient123",
    role: "patient",
    age: 45
  },
  {
    fullName: "Maria Garcia",
    email: "maria.garcia@email.com",
    password: "patient123",
    role: "patient",
    age: 32
  },
  {
    fullName: "Robert Williams",
    email: "robert.williams@email.com",
    password: "patient123",
    role: "patient",
    age: 58
  },
  {
    fullName: "Jennifer Lee",
    email: "jennifer.lee@email.com",
    password: "patient123",
    role: "patient",
    age: 28
  }
];

const medicalRecordsData = [
  // Lab Results
  {
    fileName: "CBC_Blood_Test_March2024.pdf",
    recordType: "Lab Result",
    mimeType: "application/pdf",
    fileSize: 245000,
    dummyData: {
      testName: "Complete Blood Count (CBC)",
      labName: "Quest Diagnostics",
      results: [
        { parameter: "Hemoglobin", value: "14.2 g/dL", range: "13.5-17.5", status: "normal" },
        { parameter: "WBC Count", value: "7.5 K/uL", range: "4.5-11.0", status: "normal" },
        { parameter: "Platelets", value: "250 K/uL", range: "150-450", status: "normal" },
        { parameter: "Hematocrit", value: "42%", range: "38.8-50.0", status: "normal" }
      ],
      doctor: "Dr. Sarah Johnson",
      notes: "All values within normal range. No follow-up required."
    }
  },
  {
    fileName: "Lipid_Panel_February2024.pdf",
    recordType: "Lab Result",
    mimeType: "application/pdf",
    fileSize: 189000,
    dummyData: {
      testName: "Lipid Panel",
      labName: "LabCorp",
      results: [
        { parameter: "Total Cholesterol", value: "195 mg/dL", range: "<200", status: "normal" },
        { parameter: "LDL", value: "120 mg/dL", range: "<130", status: "normal" },
        { parameter: "HDL", value: "55 mg/dL", range: ">40", status: "normal" },
        { parameter: "Triglycerides", value: "110 mg/dL", range: "<150", status: "normal" }
      ],
      doctor: "Dr. Michael Chen",
      notes: "Lipid levels optimal. Continue current diet and exercise."
    }
  },
  {
    fileName: "HbA1c_Test_January2024.pdf",
    recordType: "Lab Result",
    mimeType: "application/pdf",
    fileSize: 156000,
    dummyData: {
      testName: "HbA1c Test",
      labName: "Quest Diagnostics",
      results: [
        { parameter: "HbA1c", value: "5.8%", range: "<5.7%", status: "borderline" }
      ],
      doctor: "Dr. Michael Chen",
      notes: "Prediabetic range. Recommend lifestyle modifications and recheck in 3 months."
    }
  },
  // Prescriptions
  {
    fileName: "Prescription_Amoxicillin.pdf",
    recordType: "Prescription",
    mimeType: "application/pdf",
    fileSize: 89000,
    dummyData: {
      medication: "Amoxicillin 500mg",
      dosage: "1 capsule three times daily",
      duration: "7 days",
      prescribedBy: "Dr. Michael Chen",
      pharmacy: "CVS Pharmacy",
      instructions: "Take with food. Complete full course.",
      refills: 0,
      expiryDate: "2024-12-31"
    }
  },
  {
    fileName: "Prescription_Lisinopril.pdf",
    recordType: "Prescription",
    mimeType: "application/pdf",
    fileSize: 92000,
    dummyData: {
      medication: "Lisinopril 10mg",
      dosage: "1 tablet daily",
      duration: "30 days",
      prescribedBy: "Dr. Sarah Johnson",
      pharmacy: "Walgreens",
      instructions: "Take in the morning. Monitor blood pressure.",
      refills: 2,
      expiryDate: "2024-09-15"
    }
  },
  {
    fileName: "Prescription_Metformin.pdf",
    recordType: "Prescription",
    mimeType: "application/pdf",
    fileSize: 87000,
    dummyData: {
      medication: "Metformin 500mg",
      dosage: "1 tablet twice daily with meals",
      duration: "90 days",
      prescribedBy: "Dr. Michael Chen",
      pharmacy: "Rite Aid",
      instructions: "Take with food to reduce stomach upset.",
      refills: 3,
      expiryDate: "2024-10-20"
    }
  },
  // Radiology
  {
    fileName: "Chest_XRay_March2024.pdf",
    recordType: "Radiology",
    mimeType: "application/pdf",
    fileSize: 1250000,
    dummyData: {
      scanType: "Chest X-Ray",
      facility: "Metro Imaging Center",
      radiologist: "Dr. Emily Roberts",
      findings: "Lungs clear. No infiltrates or masses identified. Cardiac silhouette normal. Costophrenic angles sharp.",
      impression: "Normal chest X-ray. No acute cardiopulmonary process.",
      contrast: "None",
      views: "PA and Lateral"
    }
  },
  {
    fileName: "MRI_Knee_February2024.pdf",
    recordType: "Radiology",
    mimeType: "application/pdf",
    fileSize: 2450000,
    dummyData: {
      scanType: "MRI - Right Knee",
      facility: "Advanced MRI Center",
      radiologist: "Dr. Emily Roberts",
      findings: "Mild meniscal tear in posterior horn of medial meniscus. No significant joint effusion. ACL and PCL intact.",
      impression: "Grade II medial meniscal tear. Recommend orthopedic consultation.",
      contrast: "None",
      views: "Sagittal, Coronal, Axial"
    }
  },
  // Discharge Summaries
  {
    fileName: "Discharge_Summary_Appendectomy.pdf",
    recordType: "Discharge Summary",
    mimeType: "application/pdf",
    fileSize: 185000,
    dummyData: {
      admissionDate: "2024-01-15",
      dischargeDate: "2024-01-18",
      attending: "Dr. James Wilson",
      diagnosis: "Acute Appendicitis",
      procedure: "Laparoscopic Appendectomy",
      dischargeCondition: "Stable",
      followUp: "Follow up with surgeon in 2 weeks",
      medications: ["Ibuprofen 600mg PRN pain", "Cephalexin 500mg TID x 5 days"]
    }
  }
];

const riskAlertsData = [
  {
    riskLevel: "Moderate",
    probability: 0.65,
    model: "Diabetes Risk Prediction",
    payload: {
      type: "diabetes",
      message: "HbA1c level indicates prediabetes. Lifestyle modifications recommended.",
      recommendation: "Reduce sugar intake, increase physical activity, monitor blood glucose",
      factors: ["Elevated HbA1c", "Family history", "BMI 28.5"]
    }
  },
  {
    riskLevel: "Low",
    probability: 0.25,
    model: "Cardiovascular Risk Assessment",
    payload: {
      type: "cardiovascular",
      message: "Blood pressure slightly elevated during last visit.",
      recommendation: "Monitor daily, reduce sodium intake, regular exercise",
      factors: ["BP 135/85", "Age 45", "Sedentary lifestyle"]
    }
  },
  {
    riskLevel: "High",
    probability: 0.85,
    model: "Drug Interaction Checker",
    payload: {
      type: "medication",
      message: "Potential drug interaction between Lisinopril and over-the-counter NSAIDs.",
      recommendation: "Consult doctor before taking any new medications",
      factors: ["Lisinopril", "Ibuprofen", "Age > 60"]
    }
  },
  {
    riskLevel: "Moderate",
    probability: 0.55,
    model: "Diabetes Risk Prediction",
    payload: {
      type: "diabetes",
      message: "Fasting glucose borderline high. Annual screening recommended.",
      recommendation: "Diet modification, weight management, glucose monitoring",
      factors: ["Fasting glucose 102", "Overweight", "Age 58"]
    }
  }
];

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await MedicalRecord.deleteMany({});
    await EmergencyAccess.deleteMany({});
    await RiskAlert.deleteMany({});
    console.log("Existing data cleared");

    // Create Doctors
    console.log("Creating doctors...");
    const createdDoctors = [];
    for (const doctorData of doctorsData) {
      const hashedPassword = hashPassword(doctorData.password);
      const walletAddress = generateWalletAddress();
      const doctor = await User.create({
        ...doctorData,
        password: hashedPassword,
        walletAddress: walletAddress.toLowerCase()
      });
      createdDoctors.push(doctor);
      console.log(`Created doctor: ${doctor.fullName} (${doctor.email}) - Wallet: ${walletAddress}`);
    }

    // Create Patients
    console.log("\nCreating patients...");
    const createdPatients = [];
    for (const patientData of patientsData) {
      const hashedPassword = hashPassword(patientData.password);
      const walletAddress = generateWalletAddress();
      const patient = await User.create({
        ...patientData,
        password: hashedPassword,
        walletAddress: walletAddress.toLowerCase()
      });
      createdPatients.push(patient);
      console.log(`Created patient: ${patient.fullName} (${patient.email}) - Wallet: ${walletAddress}`);
    }

    // Create Medical Records
    console.log("\nCreating medical records...");
    const createdRecords = [];
    
    // Assign records to patients
    for (let i = 0; i < createdPatients.length; i++) {
      const patient = createdPatients[i];
      const doctor = createdDoctors[i % createdDoctors.length];
      
      // Assign 3-5 records per patient
      const numRecords = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < numRecords; j++) {
        const recordTemplate = medicalRecordsData[(i * 3 + j) % medicalRecordsData.length];
        const ipfsHash = generateIPFSHash();
        
        const record = await MedicalRecord.create({
          patientAddress: patient.walletAddress,
          doctorAddress: doctor.walletAddress,
          fileName: recordTemplate.fileName,
          mimeType: recordTemplate.mimeType,
          fileSize: recordTemplate.fileSize,
          ipfsHash: ipfsHash,
          ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
          chainHash: generateTxHash(),
          txHash: generateTxHash(),
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within last 90 days
        });
        
        createdRecords.push({
          ...record.toObject(),
          recordType: recordTemplate.recordType,
          dummyData: recordTemplate.dummyData,
          patientName: patient.fullName,
          doctorName: doctor.fullName
        });
        
        console.log(`Created record: ${recordTemplate.fileName} for ${patient.fullName}`);
      }
    }

    // Create Emergency Access Tickets
    console.log("\nCreating emergency access tickets...");
    const emergencyAccessData = [
      {
        patient: createdPatients[0],
        doctor: createdDoctors[1],
        reason: "Emergency room visit - chest pain evaluation",
        status: "active"
      },
      {
        patient: createdPatients[1],
        doctor: createdDoctors[0],
        reason: "Urgent care follow-up",
        status: "active"
      },
      {
        patient: createdPatients[2],
        doctor: createdDoctors[2],
        reason: "Post-surgery monitoring",
        status: "expired"
      }
    ];

    for (const accessData of emergencyAccessData) {
      const expiresAt = accessData.status === "active" 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        : new Date(Date.now() - 24 * 60 * 60 * 1000); // Expired yesterday

      await EmergencyAccess.create({
        patientAddress: accessData.patient.walletAddress,
        doctorAddress: accessData.doctor.walletAddress,
        reason: accessData.reason,
        status: accessData.status,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        expiresAt: expiresAt
      });
      console.log(`Created emergency access: ${accessData.reason}`);
    }

    // Create Risk Alerts
    console.log("\nCreating risk alerts...");
    for (let i = 0; i < createdPatients.length; i++) {
      const patient = createdPatients[i];
      const alert = riskAlertsData[i % riskAlertsData.length];
      
      await RiskAlert.create({
        patientAddress: patient.walletAddress,
        riskLevel: alert.riskLevel,
        probability: alert.probability,
        model: alert.model,
        payload: alert.payload
      });
      console.log(`Created risk alert for ${patient.fullName}: ${alert.payload.message}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 SUMMARY:");
    console.log(`   Doctors: ${createdDoctors.length}`);
    console.log(`   Patients: ${createdPatients.length}`);
    console.log(`   Medical Records: ${createdRecords.length}`);
    console.log(`   Emergency Access Tickets: ${emergencyAccessData.length}`);
    console.log(`   Risk Alerts: ${createdPatients.length}`);
    
    console.log("\n🔑 LOGIN CREDENTIALS:");
    console.log("\n   DOCTORS:");
    doctorsData.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.fullName}`);
      console.log(`      Email: ${doc.email}`);
      console.log(`      Password: ${doc.password}`);
      console.log(`      Wallet: ${createdDoctors[i].walletAddress}`);
    });
    
    console.log("\n   PATIENTS:");
    patientsData.forEach((pat, i) => {
      console.log(`   ${i + 1}. ${pat.fullName}`);
      console.log(`      Email: ${pat.email}`);
      console.log(`      Password: ${pat.password}`);
      console.log(`      Wallet: ${createdPatients[i].walletAddress}`);
    });

    console.log("\n✅ Ready for hackathon demo!");
    
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
