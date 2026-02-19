import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { connectWallet, getConnectedWallet } from "../services/blockchain";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [walletAddress, setWalletAddress] = useState("");

  const isPatient = user?.role === "patient";

  const navLinkClass = path =>
    `px-3 py-2 rounded-lg text-sm ${location.pathname === path ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`;

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

  return (
    <header className="border-b border-gray-200 bg-white/95 sticky top-0 z-20">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-medicalBlue">MEDLedger</h1>
          <span className="text-xs rounded-full bg-green-100 text-green-700 px-2 py-1">{user?.role?.toUpperCase()}</span>
        </div>

        <nav className="flex items-center gap-2">
          {isPatient && (
            <>
              <Link className={navLinkClass("/")} to="/">
                Dashboard
              </Link>
              <Link className={navLinkClass("/upload")} to="/upload">
                Upload
              </Link>
              <Link className={navLinkClass("/consent")} to="/consent">
                Consent
              </Link>
            </>
          )}

          {user?.role === "doctor" && (
            <Link className={navLinkClass("/doctor")} to="/doctor">
              Doctor Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            className={walletAddress ? "btn-green" : "btn-secondary"}
            onClick={handleWalletConnect}
            type="button"
          >
            {walletAddress ? `Wallet ${compactAddress}` : "Connect Wallet"}
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              signOut();
              navigate("/login");
            }}
            type="button"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
