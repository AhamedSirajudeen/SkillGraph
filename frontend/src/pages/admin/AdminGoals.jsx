import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminGoals() {
  const [goals, setGoals] = useState([]);
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const [{ data: goalsRes }, { data: skillsRes }] = await Promise.all([api.get("/goals"), api.get("/skills/admin/catalog")]);
    setGoals(goalsRes.data.goals);
    setSkills(skillsRes.data.skills);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/goals", form);
      setForm({ name: "", description: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function openGoal(goal) {
    const { data } = await api.get(`/goals/${goal.id}`);
    setSelectedGoal(data.data.goal);
  }

  async function toggleSkill(skillId) {
    const has = selectedGoal.requiredSkills.some((s) => s.id === skillId);
    try {
      if (has) {
        await api.delete(`/goals/${selectedGoal.id}/skills/${skillId}`);
      } else {
        await api.post(`/goals/${selectedGoal.id}/skills`, { skillId });
      }
      openGoal(selectedGoal);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manage goals</h1>

      <form onSubmit={handleCreate} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <input className="input" placeholder="Goal name" required
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn-primary whitespace-nowrap">Create goal</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">Goals</h2>
          <ul className="flex flex-col gap-2">
            {goals.map((g) => (
              <li key={g.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-2">
                <button className="text-left text-sm font-medium text-brand-700" onClick={() => openGoal(g)}>
                  {g.name}
                </button>
                <button className="text-xs text-red-600" onClick={() => handleDelete(g.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="mb-3 font-semibold">Required skills {selectedGoal ? `for "${selectedGoal.name}"` : ""}</h2>
          {!selectedGoal ? (
            <p className="text-sm text-gray-400">Select a goal to manage its skills.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => {
                const active = selectedGoal.requiredSkills.some((rs) => rs.id === s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSkill(s.id)}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      active ? "border-brand-600 bg-brand-600 text-white" : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
