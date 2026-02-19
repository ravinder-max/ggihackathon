import { useState } from "react";
import { getDoctorRecords, getEmergencyAccesses, getRiskAlerts, requestEmergencyAccess } from "../services/api";

export default function DoctorDashboard() {
  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketMessage, setTicketMessage] = useState("");
  const [activeTickets, setActiveTickets] = useState([]);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [reason, setReason] = useState("Unresponsive patient in emergency unit");
  const [durationMinutes, setDurationMinutes] = useState(30);

  const doctorAddress = (() => {
    const raw = localStorage.getItem("medledger_user");
    return raw ? JSON.parse(raw).userId : "";
  })();

  const findRecords = async () => {
    setLoading(true);
    try {
      const data = await getDoctorRecords(patientId.trim());
      setRecords(data);

      const [tickets, alerts] = await Promise.all([
        getEmergencyAccesses(patientId.trim(), doctorAddress),
        getRiskAlerts(patientId.trim(), doctorAddress)
      ]);
      setActiveTickets(tickets);
      setRiskAlerts(alerts);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyRequest = async () => {
    if (!patientId.trim()) {
      setTicketMessage("Enter patient wallet address first.");
      return;
    }

    if (!doctorAddress) {
      setTicketMessage("Doctor wallet/user ID missing in session.");
      return;
    }

    setTicketLoading(true);
    setTicketMessage("");
    try {
      const response = await requestEmergencyAccess({
        patientAddress: patientId.trim(),
        doctorAddress,
        reason,
        durationMinutes
      });
      setTicketMessage(response.message || "Emergency access requested.");
      const refreshed = await getEmergencyAccesses(patientId.trim(), doctorAddress);
      setActiveTickets(refreshed);
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Doctor Record Viewer + Emergency Access</h2>
        <div className="flex flex-wrap gap-3">
          <input
            className="input max-w-sm"
            onChange={event => setPatientId(event.target.value)}
            placeholder="Enter Patient Wallet Address"
            value={patientId}
          />
          <button className="btn-primary" onClick={findRecords} type="button">
            {loading ? "Searching..." : "View Records"}
          </button>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <input
            className="input md:col-span-2"
            onChange={event => setReason(event.target.value)}
            placeholder="Emergency reason"
            value={reason}
          />
          <input
            className="input"
            min="5"
            onChange={event => setDurationMinutes(Number(event.target.value))}
            type="number"
            value={durationMinutes}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <button className="btn-secondary" disabled={ticketLoading} onClick={handleEmergencyRequest} type="button">
            {ticketLoading ? "Requesting..." : "Break-Glass Request"}
          </button>
          {ticketMessage && <p className="text-sm text-gray-600">{ticketMessage}</p>}
        </div>
      </div>

      <div className="card">
        <h3 className="text-base font-semibold mb-3">Patient Records</h3>
        {records.length === 0 ? (
          <p className="text-sm text-gray-500">No records to display.</p>
        ) : (
          <div className="space-y-3">
            {records.map(record => (
              <div className="border border-gray-200 rounded-lg p-4" key={record.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{record.id}</p>
                    <p className="text-sm text-gray-500">Patient: {record.patientId}</p>
                    <p className="text-sm text-gray-500">Record: {record.type}</p>
                    <p className="text-sm text-gray-500">Uploaded: {new Date(record.uploadedAt).toLocaleString()}</p>
                    {record.ipfsHash && <p className="text-sm text-blue-700">IPFS: {record.ipfsHash}</p>}
                    <p className="text-xs text-gray-500">Access Mode: {record.accessMode || "N/A"}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${record.consent ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {record.consent ? "Consent Granted" : "Consent Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="text-base font-semibold mb-3">Active Emergency Tickets</h3>
          {activeTickets.length === 0 ? (
            <p className="text-sm text-gray-500">No active break-glass tickets.</p>
          ) : (
            <div className="space-y-3">
              {activeTickets.map(ticket => (
                <div className="border border-gray-200 rounded-lg p-3" key={ticket._id}>
                  <p className="text-sm font-medium text-gray-800">Reason: {ticket.reason}</p>
                  <p className="text-xs text-gray-500">Doctor: {ticket.doctorAddress}</p>
                  <p className="text-xs text-gray-500">Expires: {new Date(ticket.expiresAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-base font-semibold mb-3">High-Risk AI Alerts</h3>
          {riskAlerts.length === 0 ? (
            <p className="text-sm text-gray-500">No AI alerts for this patient.</p>
          ) : (
            <div className="space-y-3">
              {riskAlerts.map(alert => (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3" key={alert._id}>
                  <p className="text-sm font-medium text-red-700">{alert.riskLevel} Risk</p>
                  <p className="text-xs text-gray-600">Probability: {(Number(alert.probability) * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-600">Model: {alert.model}</p>
                  <p className="text-xs text-gray-600">Time: {new Date(alert.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
