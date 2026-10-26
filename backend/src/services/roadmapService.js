const userRepository = require("../repositories/userRepository");
const goalRepository = require("../repositories/goalRepository");
const userSkillRepository = require("../repositories/userSkillRepository");
const progressRepository = require("../repositories/progressRepository");
const { generateRoadmap } = require("./graph/roadmapGenerator");
const { recommendNext } = require("./graph/recommendationEngine");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function getRoadmapForUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user || !user.goal_id) {
    throw httpError("Select a career goal before viewing your roadmap", 400);
  }

  const [requiredSkills, knownSkillIds, progressRows] = await Promise.all([
    goalRepository.findRequiredSkills(user.goal_id),
    userSkillRepository.findKnownSkillIds(userId),
    progressRepository.findByUser(userId),
  ]);

  const goal = await goalRepository.findById(user.goal_id);

  const result = await generateRoadmap({
    goalId: user.goal_id,
    requiredSkillIds: requiredSkills.map((s) => s.id),
    knownSkillIds,
    progressRows,
  });

  return { goal, ...result };
}

async function getRecommendation(userId) {
  const { roadmap } = await getRoadmapForUser(userId);
  return recommendNext(roadmap);
}

async function selectGoalForUser(userId, goalId) {
  if (!Number.isInteger(goalId) || goalId <= 0) {
    throw httpError("A valid career goal is required", 400);
  }
  const goal = await goalRepository.findById(goalId);
  if (!goal) throw httpError("Selected career goal was not found", 404);

  const user = await userRepository.setGoal(userId, goalId);
  if (!user) throw httpError("User not found", 404);
  return user;
}

module.exports = { getRoadmapForUser, getRecommendation, selectGoalForUser };
