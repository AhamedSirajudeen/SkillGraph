const db = require("../database/connection");

async function findAll() {
  const { rows } = await db.query(
    `SELECT sd.id, sd.prerequisite_skill_id, sd.dependent_skill_id, sd.created_at,
            p.name AS prerequisite_name, d.name AS dependent_name
     FROM skill_dependencies sd
     JOIN skills p ON p.id = sd.prerequisite_skill_id
     JOIN skills d ON d.id = sd.dependent_skill_id
     ORDER BY sd.id`
  );
  return rows;
}

async function create(prerequisiteId, dependentId) {
  const { rows } = await db.query(
    `INSERT INTO skill_dependencies (prerequisite_skill_id, dependent_skill_id)
     VALUES ($1, $2) RETURNING *`,
    [prerequisiteId, dependentId]
  );
  return rows[0];
}

async function remove(id) {
  const { rowCount } = await db.query("DELETE FROM skill_dependencies WHERE id = $1", [id]);
  return rowCount > 0;
}

async function exists(prerequisiteId, dependentId) {
  const { rows } = await db.query(
    "SELECT 1 FROM skill_dependencies WHERE prerequisite_skill_id = $1 AND dependent_skill_id = $2",
    [prerequisiteId, dependentId]
  );
  return rows.length > 0;
}

module.exports = { findAll, create, remove, exists };
