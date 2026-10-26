import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LuxuryAuthLayout from "../components/LuxuryAuthLayout.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setResetUrl(data.data.resetUrl || "");
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
        <h2 className="mt-5 text-lg font-bold">Forgot Password?</h2>
        <p className="mb-6 mt-1 text-sm text-gray-500">Enter your registered email address to reset your password.</p>
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {resetUrl ? (
          <div className="rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">
            <p>A reset link was created.</p>
            <a className="mt-2 inline-block font-medium underline" href={resetUrl}>Open reset password page</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className="input" type="email" placeholder="Email" required value={email}
              onChange={(event) => setEmail(event.target.value)} />
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Creating reset link..." : "Continue"}
            </button>
          </form>
        )}
        <p className="mt-4 text-sm text-gray-500"><Link to="/login" className="font-medium text-brand-700">Back to login</Link></p>
      </div>
    </LuxuryAuthLayout>
  );
}
