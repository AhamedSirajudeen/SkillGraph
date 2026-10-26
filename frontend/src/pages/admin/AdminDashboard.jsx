import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/admin/stats"), api.get("/admin/users"), api.get("/goals")])
      .then(([statsRes, usersRes, goalsRes]) => {
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data.users);
        setGoals(goalsRes.data.data.goals);
      }).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-gray-600">{error}</p>;
  if (!stats) return <p className="text-gray-500">Loading...</p>;

  const cards = [
    { label: "Learners", value: stats.totalLearners },
    { label: "Skills", value: stats.totalSkills },
    { label: "Goals", value: stats.totalGoals },
    { label: "Dependencies", value: stats.totalDependencies },
    { label: "Completed skills (all learners)", value: stats.totalCompletedSkills },
  ];
  const learners = users.filter((user) => user.role === "learner");
  const goalCounts = goals.map((goal) => ({ ...goal, learners: learners.filter((user) => user.goal_id === goal.id).length }))
    .sort((a, b) => b.learners - a.learners);
  const recentLearners = learners.slice(0, 5);

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div><p className="eyebrow">Platform intelligence</p><h1 className="text-2xl font-bold">Admin dashboard</h1></div>
      <div className="grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: cards.indexOf(c) * 0.06 }} className="card">
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-gray-500">{c.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="card min-w-0 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-semibold">Learning goal distribution</h2><p className="text-xs text-gray-500">Current learner selections by goal.</p></div><Link to="/admin/goals" className="text-sm font-semibold text-brand-700">Manage goals</Link></div>
          {goalCounts.length ? <div className="flex flex-col gap-3">{goalCounts.map((goal) => <div key={goal.id} className="goal-distribution-row"><div className="flex justify-between gap-3 text-sm"><span className="truncate font-medium">{goal.name}</span><span className="shrink-0 text-gray-500">{goal.learners} learner{goal.learners === 1 ? "" : "s"}</span></div><div className="goal-distribution-track"><motion.div initial={{ width: 0 }} animate={{ width: `${learners.length ? (goal.learners / learners.length) * 100 : 0}%` }} className="goal-distribution-fill" /></div></div>)}</div> : <p className="text-sm text-gray-500">No learning goals have been created yet.</p>}
        </motion.section>
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="card min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="font-semibold">Recent learners</h2><p className="text-xs text-gray-500">Latest registered learners.</p></div><Link to="/admin/users" className="text-sm font-semibold text-brand-700">View all</Link></div>
          {recentLearners.length ? <ul className="flex flex-col gap-3">{recentLearners.map((user) => <li key={user.id} className="flex min-w-0 items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-gray-500">{user.goal_name || "No goal selected"}</p></div><span className="shrink-0 text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</span></li>)}</ul> : <p className="text-sm text-gray-500">No learners have registered yet.</p>}
        </motion.section>
      </div>
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card quick-actions"><div><h2 className="font-semibold">Management shortcuts</h2><p className="mt-1 text-sm text-gray-500">Maintain the catalogue and the learning paths that use it.</p></div><div className="flex flex-wrap gap-2"><Link className="btn-secondary" to="/admin/skills">Manage skills</Link><Link className="btn-secondary" to="/admin/dependencies">Manage dependencies</Link><Link className="btn-primary" to="/admin/goals">Assign goal skills</Link></div></motion.section>
    </div>
  );
}
