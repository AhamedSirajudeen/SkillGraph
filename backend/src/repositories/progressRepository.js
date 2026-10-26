const db = require("../database/connection");

async function findByUser(userId) {
  const { rows } = await db.query(
    `SELECT p.*, s.name AS skill_name FROM progress p
     JOIN skills s ON s.id = p.skill_id WHERE p.user_id = $1 ORDER BY p.updated_at DESC`,
    [userId]
  );
  return rows;
}

async function findOne(userId, skillId) {
  const { rows } = await db.query(
    "SELECT * FROM progress WHERE user_id = $1 AND skill_id = $2",
    [userId, skillId]
  );
  return rows[0] || null;
}

async function upsert(userId, skillId, status) {
  const now = new Date();
  const { rows } = await db.query(
    `INSERT INTO progress (user_id, skill_id, status, started_at, completed_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id, skill_id) DO UPDATE SET
       status = EXCLUDED.status,
       started_at = COALESCE(progress.started_at, EXCLUDED.started_at),
       completed_at = EXCLUDED.completed_at,
       updated_at = now()
     RETURNING *`,
    [userId, skillId, status, status === "in_progress" ? now : null, status === "completed" ? now : null]
  );
  return rows[0];
}

module.exports = { findByUser, findOne, upsert };
