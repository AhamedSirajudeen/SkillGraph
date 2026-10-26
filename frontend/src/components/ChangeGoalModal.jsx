import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChangeGoalModal({ open, onClose, onChanged }) {
  const { user, updateLocalUser } = useAuth();
  const reduceMotion = useReducedMotion();
  const [goals, setGoals] = useState([]);
  const [selectedId, setSelectedId] = useState(user?.goal_id || null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectedId(user?.goal_id || null);
    setError("");
    setLoading(true);
    api.get("/goals").then(({ data }) => setGoals(data.data.goals)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [open, user?.goal_id]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function confirmChange() {
    if (!selectedId || selectedId === user?.goal_id) return onClose();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/roadmap/goal", { goalId: selectedId });
      updateLocalUser(data.data.user);
      onChanged?.(data.data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return <AnimatePresence>
    {open && <motion.div className="goal-modal-backdrop" role="presentation" onMouseDown={onClose}
      initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section role="dialog" aria-modal="true" aria-labelledby="change-goal-title" onMouseDown={(event) => event.stopPropagation()}
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22 }} className="goal-modal">
        <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Learning direction</p><h2 id="change-goal-title" className="text-2xl font-semibold">Change your career goal</h2><p className="mt-2 text-sm text-gray-500">Your skill progress stays saved and will be reused for any shared skills.</p></div><button className="icon-button" onClick={onClose} aria-label="Close goal selection">×</button></div>
        {error && <p className="luxury-alert luxury-alert-error">{error}</p>}
        {loading ? <p className="mt-6 text-sm text-gray-500">Loading career goals…</p> : <div className="mt-6 grid max-h-[46vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {goals.map((goal) => { const current = goal.id === user?.goal_id; const selected = goal.id === selectedId; return <button key={goal.id} onClick={() => setSelectedId(goal.id)} className={`goal-option ${selected ? "goal-option-selected" : ""}`}>
            <span className="flex items-center justify-between gap-2"><strong>{goal.name}</strong>{current && <span className="goal-current">Current</span>}</span>
            <span className="mt-2 block text-left text-xs text-gray-500">{goal.description || "A focused learning path."}</span>
          </button>; })}
        </div>}
        <div className="mt-6 flex flex-wrap justify-end gap-2"><button className="btn-secondary" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={!selectedId || selectedId === user?.goal_id || saving} onClick={confirmChange}>{saving ? "Updating…" : "Confirm goal"}</button></div>
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}
