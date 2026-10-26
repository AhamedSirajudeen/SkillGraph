const db = require("../database/connection");

async function findKnownSkillIds(userId) {
  const { rows } = await db.query("SELECT skill_id FROM user_skills WHERE user_id = $1", [userId]);
  return rows.map((r) => r.skill_id);
}

async function findKnownSkills(userId) {
  const { rows } = await db.query(
    `SELECT s.* FROM user_skills us JOIN skills s ON s.id = us.skill_id
     WHERE us.user_id = $1 ORDER BY s.name`,
    [userId]
  );
  return rows;
}

async function add(userId, skillId) {
  await db.query(
    "INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [userId, skillId]
  );
}

async function addMany(userId, skillIds) {
  for (const skillId of skillIds) {
    await add(userId, skillId);
  }
}

async function remove(userId, skillId) {
  const { rowCount } = await db.query(
    "DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2",
    [userId, skillId]
  );
  return rowCount > 0;
}

module.exports = { findKnownSkillIds, findKnownSkills, add, addMany, remove };
