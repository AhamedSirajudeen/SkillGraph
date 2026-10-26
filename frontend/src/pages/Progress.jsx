import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge.jsx";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = { KNOWN: "#a78bfa", LOCKED: "#d1d5db", AVAILABLE: "#60a5fa", IN_PROGRESS: "#fbbf24", COMPLETED: "#4ade80" };

export default function Progress() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    api.get("/roadmap").then(({ data }) => setData(data.data)).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-gray-600">{error}</p>;
  if (!data) return <p className="text-gray-500">Loading...</p>;

  const counts = { KNOWN: 0, LOCKED: 0, AVAILABLE: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  data.roadmap.forEach((s) => counts[s.status]++);
  const chartData = Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  const groups = {
    Completed: data.roadmap.filter((s) => s.status === "COMPLETED"),
    "In progress": data.roadmap.filter((s) => s.status === "IN_PROGRESS"),
    Available: data.roadmap.filter((s) => s.status === "AVAILABLE"),
    Locked: data.roadmap.filter((s) => s.status === "LOCKED"),
  };

  return (
    <motion.div initial={reduceMotion ? false : "hidden"} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Progress</h1>
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="card">
        <h2 className="mb-2 font-semibold">Overall: {data.progressSummary.percentComplete}%</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={90} label isAnimationActive={!reduceMotion} animationDuration={550}>
                {chartData.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {Object.entries(groups).map(([label, items]) => (
        <motion.div key={label} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="card">
          <h2 className="mb-3 font-semibold">{label} ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-400">None</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {items.map((s) => (
                <li key={s.skillId} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm">
                  {s.name} <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
