import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { motion } from "framer-motion";

export default function SkillDetail() {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [roadmapEntry, setRoadmapEntry] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [{ data: skillRes }, { data: roadmapRes }] = await Promise.all([
        api.get(`/skills/${id}`),
        api.get("/roadmap").catch(() => ({ data: { data: { roadmap: [] } } })),
      ]);
      setSkill(skillRes.data.skill);
      setRoadmapEntry(roadmapRes.data.roadmap.find((r) => String(r.skillId) === String(id)) || null);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleAction(status) {
    try {
      await api.put(`/progress/${id}`, { status });
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (error) return <p className="text-gray-600">{error}</p>;
  if (!skill) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 14, rotateX: 2 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} className="card">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">{skill.name}</h1>
          {roadmapEntry && <span className="badge bg-brand-50 text-brand-700">{roadmapEntry.status}</span>}
        </div>
        <p className="mt-1 text-sm text-gray-500">{skill.category} - {skill.difficulty} - {skill.estimated_hours}h</p>
        <p className="mt-4 text-gray-700">{skill.description}</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 text-sm font-semibold text-gray-700">Prerequisites</h3>
            {skill.prerequisites?.length ? (
              <ul className="list-inside list-disc text-sm text-gray-600">
                {skill.prerequisites.map((p) => <li key={p.id}>{p.name}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-400">None</p>}
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold text-gray-700">Unlocks</h3>
            {skill.dependents?.length ? (
              <ul className="list-inside list-disc text-sm text-gray-600">
                {skill.dependents.map((d) => <li key={d.id}>{d.name}</li>)}
              </ul>
            ) : <p className="text-sm text-gray-400">None</p>}
          </div>
        </div>

        {roadmapEntry?.status === "LOCKED" && roadmapEntry.lockedReason && (
          <p className="mt-4 text-sm text-amber-600">{roadmapEntry.lockedReason}</p>
        )}

        <div className="mt-6 flex gap-2">
          {roadmapEntry?.status === "AVAILABLE" && (
            <button className="btn-primary" onClick={() => handleAction("in_progress")}>Start</button>
          )}
          {roadmapEntry?.status === "IN_PROGRESS" && (
            <button className="btn-primary" onClick={() => handleAction("completed")}>Mark complete</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
