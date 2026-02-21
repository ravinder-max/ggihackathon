import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginUser(form.email, form.password);
      if (result.user) {
        setUser(result.user);
        if (result.user.role === "patient") {
          navigate("/");
        } else if (result.user.role === "doctor") {
          navigate("/doctor");
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fillPatientDemo = () => {
    setForm({ email: "john.smith@email.com", password: "patient123" });
  };

  const fillDoctorDemo = () => {
    setForm({ email: "sarah.johnson@medledger.com", password: "doctor123" });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-teal-600 relative overflow-hidden">
        {/* Subtle Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
          <div className="text-center">
            <div className="mb-8">
              <img src="/logo.png" alt="MedLedger" className="h-32 w-auto mx-auto drop-shadow-2xl" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              MedLedger
            </h1>
            <p className="text-xl text-white/80 font-light max-w-md">
              Secure Medical Records Management on Blockchain
            </p>
            
            {/* Feature Points */}
            <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/logo.png" alt="MedLedger" className="h-20 w-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">MedLedger</h1>
            <p className="text-sm text-gray-500">Secure Medical Records</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-sm text-gray-500">Sign in to access your medical records</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Email Address</label>
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

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Demo Access</span>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fillPatientDemo}
                className="text-left p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <span className="text-indigo-600 font-bold text-sm">P</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">Patient</span>
                    <span className="text-xs text-gray-500">Click to fill</span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={fillDoctorDemo}
                className="text-left p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <span className="text-teal-600 font-bold text-sm">D</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 text-sm block">Doctor</span>
                    <span className="text-xs text-gray-500">Click to fill</span>
                  </div>
                </div>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-4 text-center">
              Demo: john.smith@email.com / patient123
            </p>

            {/* Signup Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Sign up
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
