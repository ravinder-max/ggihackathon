import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userId: "", password: "", role: "patient" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = event => {
    setForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async event => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signIn(form);
      navigate(user.role === "doctor" ? "/doctor" : "/");
    } catch {
      setError("Login failed. Check credentials or backend connectivity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-medicalBlue mb-1">Login to MEDLedger</h2>
        <p className="text-sm text-gray-600 mb-6">Secure blockchain health records portal</p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm block mb-1">Role</label>
            <select className="input" name="role" onChange={onChange} value={form.role}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">User ID</label>
            <input
              className="input"
              name="userId"
              onChange={onChange}
              placeholder="PT-1001 or DR-9001"
              required
              value={form.userId}
            />
          </div>

          <div>
            <label className="text-sm block mb-1">Password</label>
            <input
              className="input"
              name="password"
              onChange={onChange}
              placeholder="••••••••"
              required
              type="password"
              value={form.password}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
