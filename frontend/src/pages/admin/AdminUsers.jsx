import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/users").then(({ data }) => setUsers(data.data.users)).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-gray-600">{error}</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Goal</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">{u.goal_name || "-"}</td>
                <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
