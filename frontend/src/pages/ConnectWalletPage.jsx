import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ConnectWalletPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill with demo wallet addresses for easy testing
  const fillDemoPatientWallet = () => {
    setWalletAddress("0xb7ba9a8f302d3bf1909cef2950d1f39ddb24c89a");
  };

  const fillDemoDoctorWallet = () => {
    setWalletAddress("0x39897275605e11c73c771b1bfa28d2b1d5c141d0");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation for Ethereum address
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Please enter a valid Ethereum wallet address (0x... followed by 40 hex characters)");
      setLoading(false);
      return;
    }

    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update user with wallet address
    const updatedUser = { ...user, walletAddress: walletAddress.toLowerCase() };
    setUser(updatedUser);
    localStorage.setItem("medledger_user", JSON.stringify(updatedUser));
    localStorage.setItem("medledger_wallet", walletAddress.toLowerCase());

    // Navigate to appropriate dashboard
    if (user?.role === "patient") {
      navigate("/");
    } else if (user?.role === "doctor") {
      navigate("/doctor");
    } else {
      navigate("/");
    }
  };

  const handleSkip = () => {
    // For demo: allow skipping with a default message
    if (confirm("Skip wallet connection? In production, this would be mandatory.")) {
      if (user?.role === "patient") {
        navigate("/");
      } else if (user?.role === "doctor") {
        navigate("/doctor");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="MedLedger" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">Connect Your Wallet</h1>
          <p className="text-sm text-gray-500 mt-2">
            Link your blockchain wallet to access MedLedger
          </p>
        </div>

        {/* Wallet Connection Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-teal-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Wallet Address</h2>
                <p className="text-xs text-gray-500">Enter your Ethereum wallet address</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 font-mono"
              />
              <p className="text-xs text-gray-400 mt-2">
                Example: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </form>

          {/* Demo Quick Fill */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Demo: Quick Fill</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fillDemoPatientWallet}
                className="text-left p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200"
              >
                <span className="font-semibold text-gray-800 text-xs block">Patient Wallet</span>
                <span className="text-xs text-gray-500">John Smith</span>
              </button>
              <button
                type="button"
                onClick={fillDemoDoctorWallet}
                className="text-left p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all duration-200"
              >
                <span className="font-semibold text-gray-800 text-xs block">Doctor Wallet</span>
                <span className="text-xs text-gray-500">Dr. Sarah Johnson</span>
              </button>
            </div>
          </div>

          {/* Skip Option */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for demo →
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Your wallet address is used to anchor records on the blockchain
          </p>
        </div>
      </div>
    </div>
  );
}
