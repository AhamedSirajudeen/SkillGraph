import React, { useEffect, useState } from "react";
import api from "../../services/api";

const EMPTY = { name: "", description: "", category: "", difficulty: "beginner", estimated_hours: 0 };

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/skills/admin/catalog");
    setSkills(data.data.skills);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/skills/${editingId}`, form);
      } else {
        await api.post("/skills", form);
      }
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this skill?")) return;
    try {
      await api.delete(`/skills/${id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  function startEdit(skill) {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      description: skill.description || "",
      category: skill.category || "",
      difficulty: skill.difficulty,
      estimated_hours: skill.estimated_hours,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manage skills</h1>

      <form onSubmit={handleSubmit} className="card grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Name" required
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Category"
          value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <input className="input" type="number" min="0" placeholder="Estimated hours"
          value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: Number(e.target.value) })} />
        <textarea className="input sm:col-span-2" placeholder="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary" type="submit">{editingId ? "Update skill" : "Create skill"}</button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(EMPTY); }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="skills-grid">
        {skills.map((s) => (
          <article key={s.id} className="card skill-card">
            <div className="skill-card__content">
              <div className="flex items-start justify-between gap-3"><h2 className="skill-card__title font-semibold">{s.name}</h2><span className="badge bg-gray-100 text-gray-600">{s.difficulty}</span></div>
              <p className="mt-2 text-xs text-gray-500">{s.category || "Uncategorized"} · {s.estimated_hours}h</p>
              {s.description && <p className="skill-card__description mt-3 text-sm text-gray-600">{s.description}</p>}
            </div>
            <div className="skill-card__actions flex gap-3"><button className="text-sm font-semibold text-brand-600" onClick={() => startEdit(s)}>Edit</button><button className="text-sm font-semibold text-red-600" onClick={() => handleDelete(s.id)}>Delete</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}
