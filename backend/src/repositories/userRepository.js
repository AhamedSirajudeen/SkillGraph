const db = require("../database/connection");

async function create({ name, email, passwordHash, role = "learner" }) {
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, goal_id, created_at, updated_at`,
    [name, email, passwordHash, role]
  );
  return rows[0];
}

async function findByEmail(email) {
  const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await db.query(
    "SELECT id, name, email, role, goal_id, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

async function savePasswordResetToken(userId, tokenHash) {
  await db.query(
    `UPDATE users
     SET password_reset_token_hash = $2,
         password_reset_expires_at = now() + interval '30 minutes',
         updated_at = now()
     WHERE id = $1`,
    [userId, tokenHash]
  );
}

async function resetPassword(tokenHash, passwordHash) {
  const { rows } = await db.query(
    `UPDATE users
     SET password = $2,
         password_reset_token_hash = NULL,
         password_reset_expires_at = NULL,
         updated_at = now()
     WHERE password_reset_token_hash = $1
       AND password_reset_expires_at > now()
     RETURNING id`,
    [tokenHash, passwordHash]
  );
  return rows[0] || null;
}

async function setGoal(userId, goalId) {
  const { rows } = await db.query(
    `UPDATE users SET goal_id = $2, updated_at = now() WHERE id = $1
     RETURNING id, name, email, role, goal_id`,
    [userId, goalId]
  );
  return rows[0] || null;
}

async function updateProfile(userId, { name }) {
  const { rows } = await db.query(
    `UPDATE users SET name = COALESCE($2, name), updated_at = now() WHERE id = $1
     RETURNING id, name, email, role, goal_id`,
    [userId, name]
  );
  return rows[0] || null;
}

async function findAll() {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.goal_id, g.name AS goal_name, u.created_at
     FROM users u LEFT JOIN goals g ON g.id = u.goal_id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

module.exports = {
  create, findByEmail, findById, savePasswordResetToken, resetPassword,
  setGoal, updateProfile, findAll,
};
