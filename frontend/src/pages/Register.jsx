import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LuxuryAuthLayout from "../components/LuxuryAuthLayout.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LuxuryAuthLayout>
      <div>
        <h1 className="mb-1 text-xl font-bold text-brand-700">Create your account</h1>
        <p className="mb-6 text-sm text-gray-500">Start building your personalized roadmap.</p>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className="input" placeholder="Full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder="Password (min 8 characters)" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="font-medium text-brand-700">Log in</Link>
        </p>
      </div>
    </LuxuryAuthLayout>
  );
}
