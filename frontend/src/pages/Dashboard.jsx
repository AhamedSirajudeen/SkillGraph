import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { motion, useReducedMotion } from "framer-motion";
import ChangeGoalModal from "../components/ChangeGoalModal.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  function loadDashboard() {
    Promise.all([api.get("/roadmap"), api.get("/recommendations")])
      .then(([roadmapRes, recRes]) => {
        setData(roadmapRes.data.data);
        setRecommendation(recRes.data.data.recommendation);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => { loadDashboard(); }, []);

  if (error) {
    return (
      <div className="card">
        <p className="text-gray-700">{error}</p>
        <Link to="/onboarding" className="btn-primary mt-4 inline-flex">Select a goal</Link>
      </div>
    );
  }

  if (!data) return <p className="text-gray-500">Loading...</p>;

  const counts = { KNOWN: 0, LOCKED: 0, AVAILABLE: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  data.roadmap.forEach((s) => counts[s.status]++);

  return (
    <motion.div initial={reduceMotion ? false : "hidden"} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }} className="flex flex-col gap-6">
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Learning command center</p><h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-gray-500">Goal: {data.goal?.name}</p></div>
        <button className="btn-secondary" onClick={() => setGoalModalOpen(true)}>Change goal</button>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Overall progress</h2>
          <span className="text-sm text-gray-500">{data.progressSummary.percentComplete}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div className="h-full bg-brand-600" initial={{ width: 0 }} animate={{ width: `${data.progressSummary.percentComplete}%` }} transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }} />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {Object.entries(counts).map(([status, count]) => (
          <motion.div key={status} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="card text-center">
            <div className="text-2xl font-bold">{count}</div>
            <StatusBadge status={status} />
          </motion.div>
        ))}
      </div>

      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="card">
        <h2 className="mb-2 font-semibold">Recommended next skill</h2>
        {recommendation ? (
          <div>
            <p className="font-medium text-brand-700">{recommendation.name}</p>
            <p className="text-sm text-gray-500">{recommendation.reason}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recommendation right now — check your roadmap.</p>
        )}
        <Link to="/roadmap" className="btn-primary mt-4 inline-flex">View roadmap</Link>
      </motion.div>
      <ChangeGoalModal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} onChanged={() => { setData(null); setRecommendation(null); loadDashboard(); }} />
    </motion.div>
  );
}
