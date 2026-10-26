import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";
import { motion, useReducedMotion } from "framer-motion";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasSelectedGoal, setHasSelectedGoal] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    api.get("/skills")
      .then(({ data }) => {
        setSkills(data.data.skills);
        setHasSelectedGoal(data.data.hasSelectedGoal);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(skills.map((s) => s.category).filter(Boolean))],
    [skills]
  );

  const filtered = skills.filter(
    (s) =>
      (category === "all" || s.category === category) &&
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (error) return <p className="text-gray-600">{error}</p>;
  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!hasSelectedGoal) {
    return <EmptyState title="Choose a career goal first" description="Select a goal to view the skills in your learning path." action={<Link to="/onboarding" className="btn-primary">Choose a goal</Link>} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-2xl font-bold">Skills</h1><p className="mt-1 text-sm text-gray-500">A curated capability library for your selected path.</p></motion.div>
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="card flex flex-col gap-3 sm:flex-row">
        <input className="input sm:max-w-xs" placeholder="Search skills..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input sm:max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
        </select>
      </motion.div>
      {filtered.length === 0 ? <EmptyState title="No skills are assigned to this goal yet" description="Your administrator can add skills to this learning goal." /> : <motion.div initial={reduceMotion ? false : "hidden"} animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }} className="skills-grid">
        {filtered.map((s) => (
          <motion.div key={s.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="min-w-0"><Link to={`/skills/${s.id}`} className="card skill-card block hover:border-brand-300">
            <div className="skill-card__content">
              <div className="flex items-start justify-between gap-3">
              <h3 className="skill-card__title font-semibold">{s.name}</h3>
              <span className="badge bg-gray-100 text-gray-600">{s.difficulty}</span>
              </div>
            <p className="mt-1 text-xs text-gray-500">{s.category} - {s.estimated_hours}h</p>
            {s.status && <p className="mt-2 text-xs font-medium text-brand-700">{s.status.replace("_", " ")}</p>}
            {s.description && <p className="mt-2 skill-card__description text-sm text-gray-600">{s.description}</p>}
            </div>
            <span className="skill-card__actions text-xs font-semibold text-brand-700">View skill details →</span>
          </Link></motion.div>
        ))}
      </motion.div>}
    </div>
  );
}
