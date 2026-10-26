const userSkillRepository = require("../repositories/userSkillRepository");
const skillRepository = require("../repositories/skillRepository");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function listKnownSkills(userId) {
  return userSkillRepository.findKnownSkills(userId);
}

async function addKnownSkills(userId, skillIds) {
  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    throw httpError("skillIds must be a non-empty array", 400);
  }
  for (const id of skillIds) {
    const skill = await skillRepository.findById(id);
    if (!skill) throw httpError(`Skill ${id} does not exist`, 404);
  }
  await userSkillRepository.addMany(userId, skillIds);
  return userSkillRepository.findKnownSkills(userId);
}

async function removeKnownSkill(userId, skillId) {
  await userSkillRepository.remove(userId, skillId);
}

module.exports = { listKnownSkills, addKnownSkills, removeKnownSkill };
