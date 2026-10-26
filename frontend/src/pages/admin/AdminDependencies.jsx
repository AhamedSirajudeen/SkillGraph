import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminDependencies() {
  const [dependencies, setDependencies] = useState([]);
  const [skills, setSkills] = useState([]);
  const [prereqId, setPrereqId] = useState("");
  const [dependentId, setDependentId] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [{ data: depRes }, { data: skillRes }] = await Promise.all([
      api.get("/dependencies"),
      api.get("/skills/admin/catalog"),
    ]);
    setDependencies(depRes.data.dependencies);
    setSkills(skillRes.data.skills);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/dependencies", {
        prerequisiteSkillId: Number(prereqId),
        dependentSkillId: Number(dependentId),
      });
      setPrereqId("");
      setDependentId("");
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this dependency?")) return;
    try {
      await api.delete(`/dependencies/${id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Manage dependencies</h1>

      <form onSubmit={handleCreate} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm text-gray-600">
          Prerequisite
          <select className="input mt-1" required value={prereqId} onChange={(e) => setPrereqId(e.target.value)}>
            <option value="">Select skill</option>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <label className="flex-1 text-sm text-gray-600">
          Dependent (unlocked after)
          <select className="input mt-1" required value={dependentId} onChange={(e) => setDependentId(e.target.value)}>
            <option value="">Select skill</option>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <button className="btn-primary whitespace-nowrap">Add dependency</button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Prerequisite</th>
              <th className="px-4 py-2">Dependent</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {dependencies.map((d) => (
              <tr key={d.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{d.prerequisite_name}</td>
                <td className="px-4 py-2">{d.dependent_name}</td>
                <td className="px-4 py-2 text-right">
                  <button className="text-red-600" onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
