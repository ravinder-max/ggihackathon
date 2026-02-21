import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadRecord } from "../services/api";

// Generate realistic dummy data based on record type
const generateDummyData = (recordType, fileName) => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  
  const dummyDataMap = {
    "Lab Result": {
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
    },
    "Prescription": {
      medication: "Amoxicillin 500mg",
      dosage: "1 capsule three times daily",
      duration: "7 days",
      prescribedBy: "Dr. Michael Chen",
      pharmacy: "CVS Pharmacy",
      instructions: "Take with food. Complete full course.",
      refills: 0,
      expiryDate: "2024-12-31"
    },
    "Radiology": {
      scanType: "Chest X-Ray",
      facility: "Metro Imaging Center",
      radiologist: "Dr. Emily Roberts",
      findings: "Lungs clear. No infiltrates or masses identified. Cardiac silhouette normal.",
      impression: "Normal chest X-ray. No acute cardiopulmonary process.",
      contrast: "None",
      views: "PA and Lateral"
    },
    "Discharge Summary": {
      admissionDate: "2024-01-15",
      dischargeDate: "2024-01-18",
      attending: "Dr. James Wilson",
      diagnosis: "Acute Appendicitis",
      procedure: "Laparoscopic Appendectomy",
      dischargeCondition: "Stable",
      followUp: "Follow up with surgeon in 2 weeks",
      medications: ["Ibuprofen 600mg PRN pain", "Cephalexin 500mg TID x 5 days"]
    }
  };

  return {
    id: `temp-${Date.now()}`,
    fileName: fileName,
    recordType: recordType,
    uploadDate: now.toISOString(),
    status: "processing",
    dummyData: dummyDataMap[recordType] || dummyDataMap["Lab Result"]
  };
};

export default function UploadRecordPage() {
  const navigate = useNavigate();
  const [recordType, setRecordType] = useState("Lab Result");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async event => {
    event.preventDefault();
    if (!file) {
      setMessage("Please select a file before uploading.");
      return;
    }

    setLoading(true);
    setMessage("");
    
    // Generate and store dummy data immediately
    const dummyRecord = generateDummyData(recordType, file.name);
    const pendingRecords = JSON.parse(localStorage.getItem('pendingRecords') || '[]');
    pendingRecords.push(dummyRecord);
    localStorage.setItem('pendingRecords', JSON.stringify(pendingRecords));
    
    // Navigate to dashboard immediately to show the dummy data
    navigate('/', { state: { newRecord: dummyRecord } });
    
    try {
      await uploadRecord({ file, recordType, notes });
      // After successful upload, remove from pending and refresh
      const updatedPending = pendingRecords.filter(r => r.id !== dummyRecord.id);
      localStorage.setItem('pendingRecords', JSON.stringify(updatedPending));
    } catch (error) {
      console.error("Upload failed:", error);
      // Keep dummy data but mark as failed
      const failedRecords = JSON.parse(localStorage.getItem('pendingRecords') || '[]');
      const updatedFailed = failedRecords.map(r => 
        r.id === dummyRecord.id ? { ...r, status: "failed" } : r
      );
      localStorage.setItem('pendingRecords', JSON.stringify(updatedFailed));
    }
  };

  return (
    <section className="card max-w-2xl">
      <h2 className="text-lg font-semibold mb-4">Upload Medical Record</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm block mb-1">Record Type</label>
          <select className="input" onChange={event => setRecordType(event.target.value)} value={recordType}>
            <option>Lab Result</option>
            <option>Prescription</option>
            <option>Radiology</option>
            <option>Discharge Summary</option>
          </select>
        </div>

        <div>
          <label className="text-sm block mb-1">Clinical Notes</label>
          <textarea
            className="input min-h-28"
            onChange={event => setNotes(event.target.value)}
            placeholder="Optional notes"
            value={notes}
          />
        </div>

        <div>
          <label className="text-sm block mb-1">File</label>
          <input
            className="input"
            onChange={event => setFile(event.target.files?.[0] || null)}
            type="file"
          />
        </div>

        {message && <p className="text-sm text-gray-700">{message}</p>}

        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? "Uploading..." : "Upload to Backend"}
        </button>
      </form>
    </section>
  );
}
