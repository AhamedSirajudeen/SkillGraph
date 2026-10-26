const db = require("../database/connection");

async function findAll() {
  const { rows } = await db.query("SELECT * FROM skills ORDER BY name ASC");
  return rows;
}

async function findById(id) {
  const { rows } = await db.query("SELECT * FROM skills WHERE id = $1", [id]);
  return rows[0] || null;
}

async function create({ name, description, category, difficulty, estimated_hours }) {
  const { rows } = await db.query(
    `INSERT INTO skills (name, description, category, difficulty, estimated_hours)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, description, category, difficulty || "beginner", estimated_hours || 0]
  );
  return rows[0];
}

async function update(id, { name, description, category, difficulty, estimated_hours }) {
  const { rows } = await db.query(
    `UPDATE skills SET
       name = COALESCE($2, name),
       description = COALESCE($3, description),
       category = COALESCE($4, category),
       difficulty = COALESCE($5, difficulty),
       estimated_hours = COALESCE($6, estimated_hours),
       updated_at = now()
     WHERE id = $1 RETURNING *`,
    [id, name, description, category, difficulty, estimated_hours]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await db.query("DELETE FROM skills WHERE id = $1", [id]);
  return rowCount > 0;
}

async function findPrerequisites(skillId) {
  const { rows } = await db.query(
    `SELECT s.* FROM skill_dependencies sd
     JOIN skills s ON s.id = sd.prerequisite_skill_id
     WHERE sd.dependent_skill_id = $1 ORDER BY s.name`,
    [skillId]
  );
  return rows;
}

async function findDependents(skillId) {
  const { rows } = await db.query(
    `SELECT s.* FROM skill_dependencies sd
     JOIN skills s ON s.id = sd.dependent_skill_id
     WHERE sd.prerequisite_skill_id = $1 ORDER BY s.name`,
    [skillId]
  );
  return rows;
}

module.exports = { findAll, findById, create, update, remove, findPrerequisites, findDependents };
