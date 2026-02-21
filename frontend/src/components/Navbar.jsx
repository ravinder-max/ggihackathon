import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { connectWallet, getConnectedWallet } from "../services/blockchain";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");

  const isPatient = user?.role === "patient";

  useEffect(() => {
    setWalletAddress(getConnectedWallet());
  }, []);

  const handleWalletConnect = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
    } catch (error) {
      alert(error.message);
    }
  };

  const compactAddress = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "";

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-soft sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link to={user?.role === "doctor" ? "/doctor" : "/"} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-teal-400 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <img src="/logo.png" alt="MedLedger" className="relative h-10 w-auto object-contain rounded-lg" />
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">
                MedLedger
              </span>
            </Link>
            <span className="badge-success uppercase tracking-wider text-[10px]">
              {user?.role}
            </span>
          </div>

          {/* Navigation - Patient */}
          {isPatient && (
            <nav className="hidden md:flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl">
              <Link 
                to="/" 
                className={isActive("/") ? "nav-link-active" : "nav-link-inactive"}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Overview
                </span>
              </Link>
              <Link 
                to="/records" 
                className={isActive("/records") ? "nav-link-active" : "nav-link-inactive"}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  My Records
                </span>
              </Link>

              <Link 
                to="/consent" 
                className={isActive("/consent") ? "nav-link-active" : "nav-link-inactive"}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Consent
                </span>
              </Link>
            </nav>
          )}

          {/* Navigation - Doctor */}
          {user?.role === "doctor" && (
            <nav className="hidden md:flex items-center gap-2 bg-gray-100/50 p-1.5 rounded-2xl">
              <Link 
                to="/doctor" 
                className={isActive("/doctor") ? "nav-link-active" : "nav-link-inactive"}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dashboard
                </span>
              </Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell - Only show when logged in */}
            {user && <NotificationBell />}
            
            <button
              className={`${walletAddress ? "btn-success text-xs" : "btn-secondary text-xs"} py-2 px-3`}
              onClick={handleWalletConnect}
              type="button"
            >
              {walletAddress ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {compactAddress}
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Connect
                </span>
              )}
            </button>
            <button
              className="btn-ghost text-xs p-2"
              onClick={() => {
                signOut();
                navigate("/login");
              }}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-100 bg-white/50">
        <div className="px-4 py-2">
          <nav className="flex items-center justify-around">
            {isPatient && (
              <>
                <Link to="/" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive("/") ? "text-indigo-600" : "text-gray-500"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="text-[10px]">Home</span>
                </Link>
                <Link to="/records" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive("/records") ? "text-indigo-600" : "text-gray-500"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-[10px]">Records</span>
                </Link>

                <Link to="/consent" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive("/consent") ? "text-indigo-600" : "text-gray-500"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-[10px]">Consent</span>
                </Link>
              </>
            )}

            {user?.role === "doctor" && (
              <Link to="/doctor" className={`flex flex-col items-center gap-1 p-2 rounded-lg ${isActive("/doctor") ? "text-indigo-600" : "text-gray-500"}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-[10px]">Dashboard</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
