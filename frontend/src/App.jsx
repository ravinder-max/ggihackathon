import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import PatientDashboard from "./pages/PatientDashboard";
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
          isAuthenticated ? <Navigate replace to={user?.role === "doctor" ? "/doctor" : "/"} /> : <LoginPage />
        }
        path="/login"
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
