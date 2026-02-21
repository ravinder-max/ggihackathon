import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ConnectWalletPage from "./pages/ConnectWalletPage";
import PatientDashboard from "./pages/PatientDashboard";
import RecordsPage from "./pages/RecordsPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import UploadRecordPage from "./pages/UploadRecordPage";
import ConsentPage from "./pages/ConsentPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        element={
          isAuthenticated ? <Navigate replace to="/connect-wallet" /> : <LoginPage />
        }
        path="/login"
      />

      <Route
        element={
          isAuthenticated ? <Navigate replace to="/connect-wallet" /> : <SignupPage />
        }
        path="/signup"
      />

      <Route
        element={
          <ProtectedRoute>
            <ConnectWalletPage />
          </ProtectedRoute>
        }
        path="/connect-wallet"
      />

      <Route
        element={
          <ProtectedRoute role="patient">
            <AppLayout>
              <PatientDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
        path="/"
      />

      <Route
        element={
          <ProtectedRoute role="patient">
            <AppLayout>
              <RecordsPage />
            </AppLayout>
          </ProtectedRoute>
        }
        path="/records"
      />

      <Route
        element={
          <ProtectedRoute role="patient">
            <AppLayout>
              <AIAssistantPage />
            </AppLayout>
          </ProtectedRoute>
        }
        path="/ai-assistant"
      />

      <Route
        element={
          <ProtectedRoute role="patient">
            <AppLayout>
              <UploadRecordPage />
            </AppLayout>
          </ProtectedRoute>
        }
        path="/upload"
      />

      <Route
        element={
          <ProtectedRoute role="patient">
            <AppLayout>
              <ConsentPage />
            </AppLayout>
          </ProtectedRoute>
        }
        path="/consent"
      />

      <Route
        element={
          <ProtectedRoute role="doctor">
            <AppLayout>
              <DoctorDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
        path="/doctor"
      />

      <Route
        element={<Navigate replace to={isAuthenticated ? (user?.role === "doctor" ? "/doctor" : "/") : "/login"} />}
        path="*"
      />
    </Routes>
  );
}
