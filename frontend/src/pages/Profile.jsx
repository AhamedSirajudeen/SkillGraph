import React, { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import ChangeGoalModal from "../components/ChangeGoalModal.jsx";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, updateLocalUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put("/users/profile", { name });
      updateLocalUser({ name });
      setMessage("Profile updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Profile</h1>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm text-gray-600">
            Name
            <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-sm text-gray-600">
            Email
            <input className="input mt-1 bg-gray-50" value={user?.email || ""} disabled />
          </label>
          {message && <p className="text-sm text-gray-600">{message}</p>}
          <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
          <button type="button" className="btn-secondary" onClick={() => setGoalModalOpen(true)}>Change learning goal</button>
        </form>
      </motion.div>
      <ChangeGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} onChanged={() => setMessage("Learning goal updated. Your shared-skill progress was kept.")} />
    </div>
  );
}
