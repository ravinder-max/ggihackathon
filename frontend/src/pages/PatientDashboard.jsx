import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getPatientRecords, getRiskAlerts } from "../services/api";
import { getConnectedWallet } from "../services/blockchain";
import AnimatedCard from "../components/AnimatedCard";
import AnimatedCounter from "../components/AnimatedCounter";

export default function PatientDashboard() {
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress] = useState(getConnectedWallet());
  const [pendingRecords, setPendingRecords] = useState([]);
  const location = useLocation();

  // Load pending records from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pendingRecords') || '[]');
    setPendingRecords(stored);
  }, []);

  // Check for new record from navigation state
  useEffect(() => {
    if (location.state?.newRecord) {
      // Add the new record to pending records immediately
      setPendingRecords(prev => {
        const exists = prev.find(r => r.id === location.state.newRecord.id);
        if (!exists) {
          return [location.state.newRecord, ...prev];
        }
        return prev;
      });
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 10 seconds to check for completed uploads
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [recordsData, alertsData] = await Promise.all([
        getPatientRecords(),
        getRiskAlerts(walletAddress)
      ]);
      
      // Handle both {records: [...]} and direct array responses
      const fetchedRecords = Array.isArray(recordsData) ? recordsData : (recordsData.records || []);
      console.log("Fetched records:", fetchedRecords);
      setRecords(fetchedRecords);
      setAlerts(alertsData.alerts || []);
      
      // Clear pending records that have been successfully uploaded to MongoDB
      const currentPending = JSON.parse(localStorage.getItem('pendingRecords') || '[]');
      console.log("Current pending records:", currentPending);
      
      if (currentPending.length > 0 && fetchedRecords.length > 0) {
        // Check which pending records now exist in the database
        // Match by fileName since that's what we store in pending
        const uploadedFileNames = fetchedRecords.map(r => r.fileName).filter(Boolean);
        console.log("Uploaded file names from DB:", uploadedFileNames);
        
        const updatedPending = currentPending.filter(pendingRecord => {
          // Keep pending records that are still processing AND not yet in the database
          const isUploaded = uploadedFileNames.some(uploadedName => 
            uploadedName.toLowerCase() === pendingRecord.fileName.toLowerCase()
          );
          
          console.log(`Checking ${pendingRecord.fileName}: isUploaded=${isUploaded}`);
          
          // If uploaded, don't keep in pending
          return !isUploaded;
        });
        
        if (updatedPending.length !== currentPending.length) {
          console.log(`Clearing ${currentPending.length - updatedPending.length} uploaded records from pending`);
          localStorage.setItem('pendingRecords', JSON.stringify(updatedPending));
          setPendingRecords(updatedPending);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Combine real records with pending records for display
  const allRecords = [...pendingRecords, ...records];
  const recentRecords = allRecords.slice(0, 5);
  const totalRecordCount = allRecords.length;

  const features = [
    {
      title: "My Records",
      description: "View and manage all your medical records",
      icon: "📋",
      link: "/records",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Consent Management",
      description: "Control doctor access to your records",
      icon: "🔒",
      link: "/consent",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Upload Records",
      description: "Add new medical documents",
      icon: "📤",
      link: "/upload",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden card-gradient hover-lift">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-teal-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-500">
            Manage your health records securely on the blockchain
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
              <p className="text-2xl font-bold text-gradient">
                <AnimatedCounter end={totalRecordCount} duration={1500} />
              </p>
              <p className="text-xs text-gray-500">Total Records</p>
              {pendingRecords.length > 0 && (
                <p className="text-xs text-orange-500 mt-1">+{pendingRecords.length} uploading</p>
              )}
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
              <p className="text-2xl font-bold text-teal-600">
                <AnimatedCounter end={records.filter(r => r.status === "Shared").length} duration={1500} />
              </p>
              <p className="text-xs text-gray-500">Shared</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
              <p className="text-2xl font-bold text-indigo-600">
                <AnimatedCounter end={records.filter(r => r.status === "Encrypted").length} duration={1500} />
              </p>
              <p className="text-xs text-gray-500">Encrypted</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 hover-scale transition-transform duration-200">
              <p className="text-2xl font-bold text-orange-500">
                <AnimatedCounter end={alerts.length} duration={1500} />
              </p>
              <p className="text-xs text-gray-500">Health Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              to={feature.link}
              className="group relative overflow-hidden card-gradient hover-lift interactive-card"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
                <div className="mt-3 flex items-center text-indigo-600 text-sm font-medium">
                  <span>Access</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Records & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Records */}
        <div className="card-gradient hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Recent Records
              {(pendingRecords.length > 0) && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  +{pendingRecords.length} uploading
                </span>
              )}
            </h3>
            <Link to="/records" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              View All
            </Link>
          </div>

          {loading && records.length === 0 && pendingRecords.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (recentRecords.length === 0 && pendingRecords.length === 0) ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No records yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Show combined recent records (pending + real) */}
              {recentRecords.map((record, idx) => {
                // Check if this is a pending record (has dummyData)
                const isPending = record.dummyData !== undefined;
                
                if (isPending) {
                  return (
                    <div key={record.id || idx} className="flex flex-col gap-2 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-lg animate-pulse">
                          ⏳
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{record.fileName}</p>
                          <p className="text-xs text-orange-600 font-medium">Uploading... • {record.recordType}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-200 text-orange-700 animate-pulse">
                          Processing
                        </span>
                      </div>
                      
                      {/* Dummy Data Preview */}
                      <div className="mt-2 p-3 bg-white/70 rounded-lg">
                        {record.recordType === "Lab Result" && record.dummyData && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-700">{record.dummyData.testName}</p>
                            <p className="text-xs text-gray-500">{record.dummyData.labName}</p>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {record.dummyData.results?.slice(0, 2).map((result, i) => (
                                <div key={i} className="text-xs">
                                  <span className="text-gray-500">{result.parameter}:</span>
                                  <span className="ml-1 font-medium text-green-600">{result.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {record.recordType === "Prescription" && record.dummyData && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-700">{record.dummyData.medication}</p>
                            <p className="text-xs text-gray-500">{record.dummyData.dosage}</p>
                            <p className="text-xs text-gray-400">Prescribed by: {record.dummyData.prescribedBy}</p>
                          </div>
                        )}
                        {record.recordType === "Radiology" && record.dummyData && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-700">{record.dummyData.scanType}</p>
                            <p className="text-xs text-gray-500">{record.dummyData.facility}</p>
                            <p className="text-xs text-gray-400 truncate">{record.dummyData.impression}</p>
                          </div>
                        )}
                        {record.recordType === "Discharge Summary" && record.dummyData && (
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-700">{record.dummyData.diagnosis}</p>
                            <p className="text-xs text-gray-500">{record.dummyData.procedure}</p>
                            <p className="text-xs text-gray-400">Discharged: {record.dummyData.dischargeCondition}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                
                // Real record
                const handleViewRecord = () => {
                  // Demo mode: Show record details instead of opening IPFS
                  alert(`📄 Record Details (Demo Mode)\n\n` +
                    `File: ${record.fileName || record.title || 'Medical Record'}\n` +
                    `Type: ${record.type || record.recordType || 'Unknown'}\n` +
                    `Date: ${record.date || new Date(record.createdAt).toLocaleDateString() || 'N/A'}\n` +
                    `Doctor: ${record.doctor || 'Unknown'}\n\n` +
                    `Note: In production, this would open the actual file from IPFS.`);
                };

                return (
                  <div key={record.id || idx} className="group flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-gray-100 hover:bg-white/80 hover:shadow-sm transition-all duration-200 scale-on-hover cursor-pointer" onClick={handleViewRecord}>
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-teal-100 flex items-center justify-center text-lg">
                      {record.type === "prescription" ? "💊" : record.type === "lab" ? "🧪" : "📋"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{record.title || record.fileName || `Record #${record.id}`}</p>
                      <p className="text-xs text-gray-500">{record.date || new Date(record.createdAt).toLocaleDateString() || "Just now"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        record.status === "Shared" 
                          ? "bg-teal-100 text-teal-700" 
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {record.status || "Encrypted"}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Demo mode: Show download simulation
                          alert(`⬇️ Download Simulation (Demo Mode)\n\n` +
                            `File: ${record.fileName || record.title || 'Medical Record'}\n` +
                            `Status: Ready to download\n\n` +
                            `Note: In production, this would download the actual file from IPFS.`);
                        }}
                        className="p-1.5 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Health Alerts */}
        <div className="card-gradient hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              Health Alerts
            </h3>
            <Link to="/ai-assistant" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Check AI
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-bounce">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">All Clear!</p>
              <p className="text-sm text-gray-400 mt-1">No health alerts at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="p-3 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">⚠️</span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{alert.message}</p>
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
