import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";
import SkillCard from "../components/SkillCard.jsx";
import { motion, useReducedMotion } from "framer-motion";

export default function Roadmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [pendingSkillIds, setPendingSkillIds] = useState(() => new Set());
  const pendingSkillIdsRef = useRef(new Set());
  const reduceMotion = useReducedMotion();

  async function load() {
    try {
      const { data } = await api.get("/roadmap");
      setData(data.data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAction(skillId, status) {
    if (pendingSkillIdsRef.current.has(skillId) || !data) return;
    const previousData = data;
    setError("");
    pendingSkillIdsRef.current.add(skillId);
    setPendingSkillIds((previous) => new Set(previous).add(skillId));
    setData((previous) => {
      const roadmap = previous.roadmap.map((skill) => skill.skillId === skillId
        ? { ...skill, status: status === "in_progress" ? "IN_PROGRESS" : "COMPLETED" }
        : skill);
      const statusByName = new Map(roadmap.map((skill) => [skill.name, skill.status]));
      const reconciled = roadmap.map((skill) => {
        if (skill.status !== "LOCKED") return skill;
        const canUnlock = skill.prerequisites?.length && skill.prerequisites.every((name) => ["COMPLETED", "KNOWN"].includes(statusByName.get(name)));
        return canUnlock ? { ...skill, status: "AVAILABLE", lockedReason: null } : skill;
      });
      const completed = reconciled.filter((skill) => ["COMPLETED", "KNOWN"].includes(skill.status)).length;
      return { ...previous, roadmap: reconciled, progressSummary: { ...previous.progressSummary, completed, percentComplete: reconciled.length ? Math.round((completed / reconciled.length) * 100) : 0 } };
    });
    try {
      await api.put(`/progress/${skillId}`, { status });
    } catch (err) {
      setData(previousData);
      setError(err.message);
    } finally {
      pendingSkillIdsRef.current.delete(skillId);
      setPendingSkillIds((previous) => { const next = new Set(previous); next.delete(skillId); return next; });
    }
  }

  if (error && !data) return <p className="text-gray-600">{error}</p>;
  if (!data) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="flex flex-col gap-4">
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Your roadmap</h1>
        <p className="text-gray-500">Goal: {data.goal?.name} — {data.progressSummary.percentComplete}% complete</p>
      </motion.div>
      {error && <p role="alert" className="luxury-alert luxury-alert-error">{error}</p>}
      <motion.div initial={reduceMotion ? false : "hidden"} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }} className="roadmap-grid">
        {data.roadmap.map((skill) => (
          <motion.div key={skill.skillId} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="min-w-0"><SkillCard skill={skill} onAction={handleAction} pending={pendingSkillIds.has(skill.skillId)} /></motion.div>
        ))}
      </motion.div>
    </div>
  );
}
