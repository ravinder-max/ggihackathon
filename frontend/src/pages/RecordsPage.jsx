import { useState, useEffect } from "react";
import { getPatientRecords } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function RecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRecords();
    // Load pending records from localStorage
    const stored = JSON.parse(localStorage.getItem('pendingRecords') || '[]');
    setPendingRecords(stored);
    
    // Refresh pending records periodically
    const interval = setInterval(() => {
      const updated = JSON.parse(localStorage.getItem('pendingRecords') || '[]');
      setPendingRecords(updated);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await getPatientRecords();
      // Handle both {records: [...]} and direct array responses
      const fetchedRecords = Array.isArray(data) ? data : (data.records || []);
      console.log("RecordsPage - Fetched records:", fetchedRecords);
      setRecords(fetchedRecords);
      
      // Clear uploaded records from pending
      const currentPending = JSON.parse(localStorage.getItem('pendingRecords') || '[]');
      console.log("RecordsPage - Current pending:", currentPending);
      
      if (currentPending.length > 0 && fetchedRecords.length > 0) {
        // Match by fileName
        const uploadedFileNames = fetchedRecords.map(r => r.fileName).filter(Boolean);
        console.log("RecordsPage - Uploaded file names:", uploadedFileNames);
        
        const updatedPending = currentPending.filter(pendingRecord => {
          const isUploaded = uploadedFileNames.some(uploadedName => 
            uploadedName.toLowerCase() === pendingRecord.fileName.toLowerCase()
          );
          console.log(`RecordsPage - Checking ${pendingRecord.fileName}: isUploaded=${isUploaded}`);
          return !isUploaded;
        });
        
        if (updatedPending.length !== currentPending.length) {
          console.log(`RecordsPage: Clearing ${currentPending.length - updatedPending.length} uploaded records from pending`);
          localStorage.setItem('pendingRecords', JSON.stringify(updatedPending));
          setPendingRecords(updatedPending);
        }
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  // Combine pending and real records
  const allRecords = [...pendingRecords, ...records];
  
  const filteredRecords = allRecords.filter(record => {
    if (filter === "all") return true;
    const recordType = record.recordType || record.type || "";
    return recordType.toLowerCase().includes(filter.toLowerCase());
  });

  const getRecordIcon = (type) => {
    const icons = {
      prescription: "💊",
      lab: "🧪",
      scan: "📷",
      report: "📄",
      discharge: "🏥",
      default: "📋"
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "shared":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "encrypted":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="card-gradient">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="section-title">Medical Records</h1>
            <p className="section-subtitle">View and manage all your medical records securely</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="input w-40"
            >
              <option value="all">All Types</option>
              <option value="prescription">Prescriptions</option>
              <option value="lab">Lab Reports</option>
              <option value="scan">Scans</option>
              <option value="report">Reports</option>
            </select>
            <button 
              onClick={fetchRecords}
              className="btn-secondary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card border-l-4 border-l-indigo-500">
          <div className="stat-icon bg-indigo-100">📋</div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{allRecords.length}</p>
            <p className="text-xs text-gray-500">Total Records</p>
            {pendingRecords.length > 0 && (
              <p className="text-xs text-orange-500">+{pendingRecords.length} uploading</p>
            )}
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-teal-500">
          <div className="stat-icon bg-teal-100">💊</div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {allRecords.filter(r => (r.recordType || r.type)?.toLowerCase().includes("prescription")).length}
            </p>
            <p className="text-xs text-gray-500">Prescriptions</p>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-orange-500">
          <div className="stat-icon bg-orange-100">🧪</div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {allRecords.filter(r => (r.recordType || r.type)?.toLowerCase().includes("lab")).length}
            </p>
            <p className="text-xs text-gray-500">Lab Reports</p>
          </div>
        </div>
        <div className="stat-card border-l-4 border-l-purple-500">
          <div className="stat-icon bg-purple-100">📷</div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {allRecords.filter(r => (r.recordType || r.type)?.toLowerCase().includes("scan") || (r.recordType || r.type)?.toLowerCase().includes("radiology")).length}
            </p>
            <p className="text-xs text-gray-500">Scans</p>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="card-gradient">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Your Records
          {pendingRecords.length > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              +{pendingRecords.length} uploading
            </span>
          )}
        </h3>

        {loading && filteredRecords.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No records found</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first medical record to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record, index) => {
              // Check if this is a pending record
              const isPending = record.dummyData !== undefined;
              
              if (isPending) {
                return (
                  <div 
                    key={record.id || index}
                    className="group flex flex-col gap-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl animate-pulse">
                        ⏳
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800 truncate">{record.fileName}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-200 text-orange-700 animate-pulse">
                            Processing
                          </span>
                        </div>
                        <p className="text-sm text-orange-600 flex items-center gap-2 mt-1">
                          <span>{record.recordType}</span>
                          <span className="w-1 h-1 bg-orange-300 rounded-full"></span>
                          <span>Uploading...</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* Dummy Data Preview */}
                    <div className="p-3 bg-white/70 rounded-lg">
                      {record.recordType === "Lab Result" && record.dummyData && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">{record.dummyData.testName}</p>
                          <p className="text-xs text-gray-500">{record.dummyData.labName}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {record.dummyData.results?.map((result, i) => (
                              <div key={i} className="text-xs bg-white p-2 rounded">
                                <p className="text-gray-500">{result.parameter}</p>
                                <p className="font-medium text-green-600">{result.value}</p>
                                <p className="text-gray-400">{result.range}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">{record.dummyData.doctor}</p>
                        </div>
                      )}
                      {record.recordType === "Prescription" && record.dummyData && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">{record.dummyData.medication}</p>
                          <p className="text-xs text-gray-500">{record.dummyData.dosage} • {record.dummyData.duration}</p>
                          <p className="text-xs text-gray-400">Prescribed by: {record.dummyData.prescribedBy}</p>
                          <p className="text-xs text-gray-400">Pharmacy: {record.dummyData.pharmacy}</p>
                        </div>
                      )}
                      {record.recordType === "Radiology" && record.dummyData && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">{record.dummyData.scanType}</p>
                          <p className="text-xs text-gray-500">{record.dummyData.facility}</p>
                          <p className="text-xs text-gray-600">{record.dummyData.findings}</p>
                          <p className="text-xs text-gray-400">Impression: {record.dummyData.impression}</p>
                        </div>
                      )}
                      {record.recordType === "Discharge Summary" && record.dummyData && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">{record.dummyData.diagnosis}</p>
                          <p className="text-xs text-gray-500">{record.dummyData.procedure}</p>
                          <p className="text-xs text-gray-400">Attending: {record.dummyData.attending}</p>
                          <p className="text-xs text-gray-400">Discharged: {record.dummyData.dischargeCondition}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              
              // Real record
              const handleView = () => {
                const ipfsUrl = record.ipfsUrl || record.file?.ipfsUrl;
                // For demo: Show record details modal instead of opening IPFS
                // In production, this would open the actual IPFS file
                alert(`📄 Record Details (Demo Mode)\n\n` +
                  `File: ${record.fileName || record.title || 'Medical Record'}\n` +
                  `Type: ${record.type || record.recordType || 'Unknown'}\n` +
                  `Date: ${record.date || new Date(record.createdAt).toLocaleDateString() || 'N/A'}\n` +
                  `Doctor: ${record.doctor || 'Unknown'}\n\n` +
                  `IPFS Hash: ${record.ipfsHash || record.file?.ipfsHash || 'N/A'}\n\n` +
                  `Note: In production, this would open the actual file from IPFS.`);
              };

              const handleDownload = () => {
                // For demo: Show download simulation
                alert(`⬇️ Download Simulation (Demo Mode)\n\n` +
                  `File: ${record.fileName || record.title || 'Medical Record'}\n` +
                  `Status: Ready to download\n\n` +
                  `Note: In production, this would download the actual file from IPFS.`);
              };

              return (
                <div 
                  key={record.id || index}
                  className="group flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-teal-100 flex items-center justify-center text-2xl cursor-pointer hover:scale-110 transition-transform" onClick={handleView} title="Click to view">
                    {getRecordIcon(record.type)}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={handleView}>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800 truncate hover:text-indigo-600 transition-colors">{record.title || record.fileName || `Record #${record.id}`}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(record.status)}`}>
                        {record.status || "Encrypted"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <span>{record.type || record.recordType || "Unknown"}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{record.date || new Date(record.createdAt).toLocaleDateString() || "Just now"}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>Dr. {record.doctor || record.dummyData?.doctor || "Unknown"}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleView}
                      className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Download file"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
