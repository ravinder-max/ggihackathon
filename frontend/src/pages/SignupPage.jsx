import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    age: "",
    specialization: "",
    licenseNumber: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      // Generate a temporary wallet address (will be updated in connect-wallet page)
      const tempWallet = "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join("");

      const userData = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
        walletAddress: tempWallet,
        age: form.age ? parseInt(form.age) : undefined,
        specialization: form.role === "doctor" ? form.specialization : undefined,
        licenseNumber: form.role === "doctor" ? form.licenseNumber : undefined
      };

      const result = await registerUser(userData);
      if (result.user) {
        setUser(result.user);
        // Clear the temp wallet so they must connect real one
        localStorage.removeItem("medledger_wallet");
        // Redirect to connect wallet page
        navigate("/connect-wallet");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-teal-600 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="text-center">
            <div className="mb-8">
              <img src="/logo.png" alt="MedLedger" className="h-32 w-auto mx-auto drop-shadow-2xl" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              MedLedger
            </h1>
            <p className="text-xl text-white/80 font-light max-w-md">
              Join the future of secure medical records
            </p>
            
            <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm">Blockchain Secured Records</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-sm">End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-sm">AI-Powered Health Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-4 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="MedLedger" className="h-20 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">MedLedger</h1>
            <p className="text-sm text-gray-500">Secure Medical Records</p>
          </div>

          {/* Signup Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-sm text-gray-500">Sign up to get started with MedLedger</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: "patient" }))}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  form.role === "patient"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 hover:border-indigo-200"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👤</span>
                  <span className="font-medium text-sm">Patient</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: "doctor" }))}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  form.role === "doctor"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 hover:border-teal-200"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👨‍⚕️</span>
                  <span className="font-medium text-sm">Doctor</span>
                </div>
              </button>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  required
                />
              </div>

              {form.role === "patient" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="30"
                    min="1"
                    max="120"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  />
                </div>
              )}

              {form.role === "doctor" && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Specialization *
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="Cardiology"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all duration-200"
                      required={form.role === "doctor"}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      License Number *
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={form.licenseNumber}
                      onChange={handleChange}
                      placeholder="MD-2024-001"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all duration-200"
                      required={form.role === "doctor"}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                  required
                />
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
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Protected by blockchain technology
          </p>
        </div>
      </div>
    </div>
  );
}
