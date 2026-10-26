const db = require("../database/connection");

async function findAll() {
  const { rows } = await db.query("SELECT * FROM goals ORDER BY name ASC");
  return rows;
}

async function findById(id) {
  const { rows } = await db.query("SELECT * FROM goals WHERE id = $1", [id]);
  return rows[0] || null;
}

async function create({ name, description }) {
  const { rows } = await db.query(
    "INSERT INTO goals (name, description) VALUES ($1, $2) RETURNING *",
    [name, description]
  );
  return rows[0];
}

async function update(id, { name, description }) {
  const { rows } = await db.query(
    `UPDATE goals SET name = COALESCE($2, name), description = COALESCE($3, description),
     updated_at = now() WHERE id = $1 RETURNING *`,
    [id, name, description]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await db.query("DELETE FROM goals WHERE id = $1", [id]);
  return rowCount > 0;
}

async function findRequiredSkills(goalId) {
  const { rows } = await db.query(
    `SELECT s.* FROM goal_skills gs JOIN skills s ON s.id = gs.skill_id
     WHERE gs.goal_id = $1 ORDER BY s.name`,
    [goalId]
  );
  return rows;
}

async function addSkill(goalId, skillId) {
  await db.query(
    "INSERT INTO goal_skills (goal_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [goalId, skillId]
  );
}

async function removeSkill(goalId, skillId) {
  const { rowCount } = await db.query(
    "DELETE FROM goal_skills WHERE goal_id = $1 AND skill_id = $2",
    [goalId, skillId]
  );
  return rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove, findRequiredSkills, addSkill, removeSkill };
