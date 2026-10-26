import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LuxuryAuthLayout from "../components/LuxuryAuthLayout.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : user.goal_id ? "/dashboard" : "/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LuxuryAuthLayout>
      <div>
        <h1 className="mb-1 text-xl font-bold text-brand-700">SkillGraph</h1>
        <p className="mb-6 text-sm text-gray-500">Log in to continue your roadmap.</p>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className="input" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Link to="/forgot-password" className="-mt-1 self-end text-sm font-medium text-brand-700 hover:underline">
            Forgot Password?
          </Link>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          No account? <Link to="/register" className="font-medium text-brand-700">Register</Link>
        </p>
      </div>
    </LuxuryAuthLayout>
  );
}
