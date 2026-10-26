const progressRepository = require("../repositories/progressRepository");
const { getRoadmapForUser } = require("./roadmapService");
const { STATUS } = require("./graph/roadmapGenerator");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function listProgress(userId) {
  return progressRepository.findByUser(userId);
}

/**
 * Updates progress on a skill, enforcing that a skill can only be started
 * or completed once it is AVAILABLE, KNOWN, IN_PROGRESS (to complete) —
 * never while LOCKED. The frontend is never trusted for this check.
 */
async function updateProgress(userId, skillId, status) {
  if (!["in_progress", "completed"].includes(status)) {
    throw httpError("status must be \"in_progress\" or \"completed\"", 400);
  }

  const { roadmap } = await getRoadmapForUser(userId);
  const entry = roadmap.find((item) => item.skillId === skillId);

  if (!entry) {
    throw httpError("This skill is not part of your current roadmap", 404);
  }

  if (entry.status === STATUS.LOCKED) {
    throw httpError("Skill is locked because prerequisite skills are incomplete", 400);
  }

  if (entry.status === STATUS.KNOWN && status === "in_progress") {
    throw httpError("You already know this skill", 400);
  }

  return progressRepository.upsert(userId, skillId, status);
}

module.exports = { listProgress, updateProgress };
