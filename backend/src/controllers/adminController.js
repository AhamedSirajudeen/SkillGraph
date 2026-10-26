const db = require("../database/connection");
const userRepository = require("../repositories/userRepository");
const { success } = require("../utils/response");

async function stats(req, res, next) {
  try {
    const [users, skills, goals, dependencies, completedProgress] = await Promise.all([
      db.query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'learner'"),
      db.query("SELECT COUNT(*)::int AS count FROM skills"),
      db.query("SELECT COUNT(*)::int AS count FROM goals"),
      db.query("SELECT COUNT(*)::int AS count FROM skill_dependencies"),
      db.query("SELECT COUNT(*)::int AS count FROM progress WHERE status = 'completed'"),
    ]);

    return success(res, {
      totalLearners: users.rows[0].count,
      totalSkills: skills.rows[0].count,
      totalGoals: goals.rows[0].count,
      totalDependencies: dependencies.rows[0].count,
      totalCompletedSkills: completedProgress.rows[0].count,
    });
  } catch (err) { next(err); }
}

async function listUsers(req, res, next) {
  try { return success(res, { users: await userRepository.findAll() }); }
  catch (err) { next(err); }
}

module.exports = { stats, listUsers };
