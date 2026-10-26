import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import LuxuryAuthLayout from "../components/LuxuryAuthLayout.jsx";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!token) return setError("This password reset link is invalid or has expired.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password, confirmPassword });
      setSuccess(true);
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
        <h2 className="mt-5 text-lg font-bold">Reset Password</h2>
        {success ? (
          <div className="mt-4 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-700">
            <p>Your password has been reset successfully.</p>
            <Link to="/login" className="mt-2 inline-block font-medium underline">Return to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <input className="input" type="password" placeholder="New password (8+ characters)" required value={password}
              onChange={(event) => setPassword(event.target.value)} />
            <input className="input" type="password" placeholder="Confirm new password" required value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)} />
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
          </form>
        )}
      </div>
    </LuxuryAuthLayout>
  );
}
