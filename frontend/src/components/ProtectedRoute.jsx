import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if wallet is connected (skip for connect-wallet page itself)
  const walletAddress = localStorage.getItem("medledger_wallet");
  if (!walletAddress && location.pathname !== "/connect-wallet") {
    return <Navigate to="/connect-wallet" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "doctor" ? "/doctor" : "/"} replace />;
  }

  return children;
}
