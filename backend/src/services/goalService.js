const goalRepository = require("../repositories/goalRepository");
const skillRepository = require("../repositories/skillRepository");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function listGoals() {
  return goalRepository.findAll();
}

async function getGoal(id) {
  const goal = await goalRepository.findById(id);
  if (!goal) throw httpError("Goal not found", 404);
  const requiredSkills = await goalRepository.findRequiredSkills(id);
  return { ...goal, requiredSkills };
}

async function createGoal(data) {
  if (!data.name || !data.name.trim()) throw httpError("Goal name is required", 400);
  return goalRepository.create(data);
}

async function updateGoal(id, data) {
  const updated = await goalRepository.update(id, data);
  if (!updated) throw httpError("Goal not found", 404);
  return updated;
}

async function deleteGoal(id) {
  const deleted = await goalRepository.remove(id);
  if (!deleted) throw httpError("Goal not found", 404);
}

async function addSkillToGoal(goalId, skillId) {
  const [goal, skill] = await Promise.all([
    goalRepository.findById(goalId),
    skillRepository.findById(skillId),
  ]);
  if (!goal) throw httpError("Goal not found", 404);
  if (!skill) throw httpError("Skill not found", 404);
  await goalRepository.addSkill(goalId, skillId);
}

async function removeSkillFromGoal(goalId, skillId) {
  await goalRepository.removeSkill(goalId, skillId);
}

module.exports = { listGoals, getGoal, createGoal, updateGoal, deleteGoal, addSkillToGoal, removeSkillFromGoal };
