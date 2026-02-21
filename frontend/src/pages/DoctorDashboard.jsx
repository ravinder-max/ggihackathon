import { useState } from "react";
import { getDoctorRecords, getEmergencyAccesses, getRiskAlerts, requestEmergencyAccess } from "../services/api";
import AnimatedCounter from "../components/AnimatedCounter";

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
    return raw ? JSON.parse(raw).walletAddress : "";
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="card-gradient hover-lift">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl shadow-lg">
            👨‍⚕️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
            <p className="text-gray-500">Access patient records and manage emergency access</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
          <p className="text-2xl font-bold text-gradient">
            <AnimatedCounter end={records.length} duration={1000} />
          </p>
          <p className="text-xs text-gray-500">Patient Records</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
          <p className="text-2xl font-bold text-teal-600">
            <AnimatedCounter end={records.filter(r => r.consent).length} duration={1000} />
          </p>
          <p className="text-xs text-gray-500">With Consent</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
          <p className="text-2xl font-bold text-indigo-600">
            <AnimatedCounter end={activeTickets.length} duration={1000} />
          </p>
          <p className="text-xs text-gray-500">Active Tickets</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
          <p className="text-2xl font-bold text-red-500">
            <AnimatedCounter end={riskAlerts.length} duration={1000} />
          </p>
          <p className="text-xs text-gray-500">Risk Alerts</p>
        </div>
      </div>

      {/* Patient Search & Emergency Access */}
      <div className="card-gradient">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Patient Record Access</h2>
            <p className="text-sm text-gray-500">Search by patient wallet address</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            className="input flex-1 min-w-[280px]"
            onChange={event => setPatientId(event.target.value)}
            placeholder="Enter Patient Wallet Address (0x...)"
            value={patientId}
          />
          <button 
            className="btn-primary flex items-center gap-2" 
            onClick={findRecords} 
            type="button"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                View Records
              </>
            )}
          </button>
        </div>

        {/* Emergency Access Section */}
        <div className="mt-6 pt-6 border-t border-gray-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Emergency Break-Glass Access</h3>
              <p className="text-sm text-gray-500">Request temporary access for emergency situations</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <input
              className="input md:col-span-2"
              onChange={event => setReason(event.target.value)}
              placeholder="Emergency reason (e.g., Unresponsive patient)"
              value={reason}
            />
            <div className="flex items-center gap-2">
              <input
                className="input"
                min="5"
                max="120"
                onChange={event => setDurationMinutes(Number(event.target.value))}
                type="number"
                value={durationMinutes}
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">minutes</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <button 
              className="btn-danger flex items-center gap-2" 
              disabled={ticketLoading} 
              onClick={handleEmergencyRequest} 
              type="button"
            >
              {ticketLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Requesting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Request Emergency Access
                </>
              )}
            </button>
            {ticketMessage && (
              <div className={`text-sm px-4 py-2 rounded-lg ${ticketMessage.includes('Error') || ticketMessage.includes('missing') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-teal-50 text-teal-600 border border-teal-200'}`}>
                {ticketMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Records */}
      <div className="card-gradient hover-lift">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Patient Records</h3>
              <p className="text-sm text-gray-500">View and manage medical records</p>
            </div>
          </div>
          {records.length > 0 && (
            <span className="text-sm text-gray-500">{records.length} records found</span>
          )}
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No records to display. Search for a patient above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => {
              const handleViewRecord = () => {
                if (record.consent) {
                  alert(`📄 Patient Record Details (Doctor View)\n\n` +
                    `Record ID: ${record.id}\n` +
                    `File: ${record.fileName || record.type}\n` +
                    `Record Type: ${record.recordType || 'Medical Record'}\n` +
                    `Patient: ${record.patientId}\n` +
                    `Doctor: ${record.doctor || 'Unknown'}\n` +
                    `Access Mode: ${record.accessMode}\n` +
                    `Uploaded: ${new Date(record.uploadedAt).toLocaleString()}\n\n` +
                    `IPFS Hash: ${record.ipfsHash || 'N/A'}\n\n` +
                    `Note: In production, this would open the actual medical file from IPFS.`);
                } else {
                  alert(`🔒 Access Denied\n\n` +
                    `You don't have consent to view this record yet.\n\n` +
                    `Request emergency access or wait for patient consent.`);
                }
              };

              return (
                <div 
                  className="group bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:bg-white/80 hover:shadow-md transition-all duration-200 cursor-pointer" 
                  key={record.id}
                  onClick={handleViewRecord}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">{record.fileName || record.type}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${record.consent ? "bg-teal-100 text-teal-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {record.consent ? "✓ Consent Granted" : "⏳ Consent Pending"}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-500"><span className="text-gray-400">Patient:</span> {record.patientId}</p>
                        <p className="text-gray-500"><span className="text-gray-400">Type:</span> {record.recordType || record.type}</p>
                        <p className="text-gray-500"><span className="text-gray-400">Doctor:</span> {record.doctor || 'Unknown'}</p>
                        <p className="text-gray-500"><span className="text-gray-400">Uploaded:</span> {new Date(record.uploadedAt).toLocaleString()}</p>
                        {record.ipfsHash && record.consent && (
                          <p className="text-indigo-600 truncate">
                            <span className="text-gray-400">IPFS:</span> {record.ipfsHash.slice(0, 20)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRecord();
                        }}
                        className={`p-2 rounded-lg transition-colors ${record.consent ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-400 cursor-not-allowed'}`}
                        title={record.consent ? "View record" : "Consent required"}
                        disabled={!record.consent}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Emergency Tickets & Risk Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Emergency Tickets */}
        <div className="card-gradient hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Active Emergency Tickets</h3>
              <p className="text-sm text-gray-500">Break-glass access requests</p>
            </div>
          </div>

          {activeTickets.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No active emergency tickets</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTickets.map(ticket => (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4" key={ticket._id}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{ticket.reason}</p>
                      <p className="text-xs text-gray-500 mt-1">Expires: {new Date(ticket.expiresAt).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 truncate">{ticket.doctorAddress}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High-Risk AI Alerts */}
        <div className="card-gradient hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">AI Risk Alerts</h3>
              <p className="text-sm text-gray-500">High-risk patient predictions</p>
            </div>
          </div>

          {riskAlerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No risk alerts for this patient</p>
            </div>
          ) : (
            <div className="space-y-3">
              {riskAlerts.map(alert => (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4" key={alert._id}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.riskLevel === 'High' ? 'bg-red-200' : alert.riskLevel === 'Moderate' ? 'bg-orange-200' : 'bg-yellow-200'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        alert.riskLevel === 'High' ? 'text-red-700' : alert.riskLevel === 'Moderate' ? 'text-orange-700' : 'text-yellow-700'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800 text-sm">{alert.riskLevel} Risk</span>
                        <span className="text-xs text-gray-500">{(Number(alert.probability) * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Model: {alert.model}</p>
                      <p className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
