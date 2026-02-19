import { useEffect, useState } from "react";
import { getPatientRecords, predictHealthRisk } from "../services/api";

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskForm, setRiskForm] = useState({
    age: 45,
    bmi: 27.5,
    systolic_bp: 130,
    glucose: 120,
    smoker: 0,
    family_history: 0
  });
  const [analysisFile, setAnalysisFile] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [riskResult, setRiskResult] = useState(null);
  const [riskError, setRiskError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPatientRecords();
        if (mounted) {
          setRecords(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateRiskField = event => {
    const { name, value } = event.target;
    setRiskForm(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleAnalysisFileChange = event => {
    const file = event.target.files?.[0] || null;
    setAnalysisFile(file);
  };

  const handlePredictRisk = async event => {
    event.preventDefault();
    setPredicting(true);
    setRiskError("");
    try {
      const user = localStorage.getItem("medledger_user");
      const patientAddress = localStorage.getItem("medledger_wallet") || (user ? JSON.parse(user).userId : "");

      const result = await predictHealthRisk({
        ...riskForm,
        patientAddress,
        analysisFile
      });
      setRiskResult(result);
    } catch {
      setRiskError("Unable to fetch AI prediction right now.");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold text-medicalBlue">{records.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Shared Records</p>
          <p className="text-2xl font-bold text-softGreen">{records.filter(record => record.status === "Shared").length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Encrypted</p>
          <p className="text-2xl font-bold text-medicalBlue">{records.filter(record => record.status === "Encrypted").length}</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">My Records</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Loading records...</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2">Record ID</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr className="border-b border-gray-100" key={record.id}>
                    <td className="py-2">{record.id}</td>
                    <td>{record.type}</td>
                    <td>{record.date}</td>
                    <td>{record.doctor}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs ${record.status === "Shared" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">AI Health Risk Predictor</h3>
        <form className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" onSubmit={handlePredictRisk}>
          <div>
            <label className="text-sm block mb-1">Age</label>
            <input className="input" min="0" name="age" onChange={updateRiskField} type="number" value={riskForm.age} />
          </div>
          <div>
            <label className="text-sm block mb-1">BMI</label>
            <input className="input" min="10" name="bmi" onChange={updateRiskField} step="0.1" type="number" value={riskForm.bmi} />
          </div>
          <div>
            <label className="text-sm block mb-1">Systolic BP</label>
            <input className="input" min="70" name="systolic_bp" onChange={updateRiskField} type="number" value={riskForm.systolic_bp} />
          </div>
          <div>
            <label className="text-sm block mb-1">Glucose</label>
            <input className="input" min="40" name="glucose" onChange={updateRiskField} type="number" value={riskForm.glucose} />
          </div>
          <div>
            <label className="text-sm block mb-1">Smoking Status</label>
            <select className="input" name="smoker" onChange={updateRiskField} value={riskForm.smoker}>
              <option value={0}>Non-smoker</option>
              <option value={1}>Smoker</option>
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Family History of Chronic Illness</label>
            <select className="input" name="family_history" onChange={updateRiskField} value={riskForm.family_history}>
              <option value={0}>No known history</option>
              <option value={1}>Present</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-sm block mb-1">Upload Report / Scan for AI Analysis (Optional)</label>
            <input className="input" onChange={handleAnalysisFileChange} type="file" />
            <p className="text-xs text-gray-500 mt-1">
              Upload lab report, prescription, discharge summary, or scan file so AI can analyze record context.
            </p>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
            <button className="btn-primary" disabled={predicting} type="submit">
              {predicting ? "Predicting..." : "Predict Health Risk"}
            </button>
            {riskError && <p className="text-sm text-red-600">{riskError}</p>}
          </div>
        </form>

        {riskResult && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500 mb-2">Model: {riskResult.model}</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                Probability: {(Number(riskResult.risk_probability) * 100).toFixed(1)}%
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700">Disease Focus: {riskResult.disease_prediction}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  riskResult.risk_level === "High"
                    ? "bg-red-100 text-red-700"
                    : riskResult.risk_level === "Moderate"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                }`}
              >
                Risk Level: {riskResult.risk_level}
              </span>
            </div>
            {riskResult.analysis_source && (
              <p className="text-xs text-gray-600 mt-2">
                Records analyzed: {riskResult.analysis_source.records_considered} • Uploaded file used: {riskResult.analysis_source.uploaded_file_used ? "Yes" : "No"}
              </p>
            )}
            {Array.isArray(riskResult.disease_candidates) && riskResult.disease_candidates.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-1">Top Disease Candidates</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {riskResult.disease_candidates.map(candidate => (
                    <li key={candidate.disease}>
                      {candidate.disease} (score: {candidate.score})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
