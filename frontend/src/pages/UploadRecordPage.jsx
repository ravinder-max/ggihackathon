import { useState } from "react";
import { uploadRecord } from "../services/api";

export default function UploadRecordPage() {
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
    try {
      await uploadRecord({ file, recordType, notes });
      setMessage("Record uploaded successfully.");
      setNotes("");
      setFile(null);
      event.target.reset();
    } catch {
      setMessage("Upload failed. Verify backend endpoint and try again.");
    } finally {
      setLoading(false);
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
