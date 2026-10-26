import React, { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const FloatingKnowledgeObject = lazy(() => import("../components/FloatingKnowledgeObject.jsx"));

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateLocalUser } = useAuth();
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState([]);
  const [skills, setSkills] = useState([]);
  const [goalId, setGoalId] = useState(null);
  const [knownSkillIds, setKnownSkillIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    api.get("/goals").then(({ data }) => setGoals(data.data.goals));
  }, []);

  // Before the goal is persisted, use the selected goal's existing
  // goal_skills relation rather than the learner-facing skills catalogue.
  useEffect(() => {
    if (!goalId) return;
    api.get(`/goals/${goalId}`).then(({ data }) => setSkills(data.data.goal.requiredSkills || []));
  }, [goalId]);

  function toggleSkill(id) {
    setKnownSkillIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function finish() {
    setSaving(true);
    setError("");
    try {
      await api.post("/roadmap/goal", { goalId });
      if (knownSkillIds.length > 0) {
        await api.post("/user-skills", { skillIds: knownSkillIds });
      }
      updateLocalUser({ goal_id: goalId });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="luxury-shell relative mx-auto flex min-h-screen max-w-none flex-col justify-center overflow-hidden px-4 py-10">
      <Suspense fallback={null}><FloatingKnowledgeObject className="app-sculpture" /></Suspense>
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18, rotateX: 3 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} className="card relative z-10 mx-auto w-full max-w-2xl">
        <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="goal" initial={reduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <h2 className="mb-1 text-lg font-bold">What is your career goal?</h2>
            <p className="mb-4 text-sm text-gray-500">We will build your roadmap around this.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoalId(g.id)}
                  className={`rounded-lg border p-3 text-left text-sm ${
                    goalId === g.id ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-brand-300"
                  }`}
                >
                  <div className="font-medium">{g.name}</div>
                  {g.description && <div className="mt-1 text-xs text-gray-500">{g.description}</div>}
                </button>
              ))}
            </div>
            <button className="btn-primary mt-6" disabled={!goalId} onClick={() => setStep(2)}>
              Next
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="skills" initial={reduceMotion ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <h2 className="mb-1 text-lg font-bold">Which skills do you already know?</h2>
            <p className="mb-4 text-sm text-gray-500">Select any you have already mastered. This is optional.</p>
            <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto">
              {skills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSkill(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    knownSkillIds.includes(s.id)
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-gray-300 text-gray-700 hover:border-brand-400"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex gap-2">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" disabled={saving} onClick={finish}>
                {saving ? "Saving..." : "Finish"}
              </button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
