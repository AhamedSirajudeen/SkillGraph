const skillRepository = require("../repositories/skillRepository");
const goalRepository = require("../repositories/goalRepository");
const userSkillRepository = require("../repositories/userSkillRepository");
const progressRepository = require("../repositories/progressRepository");
const graphBuilder = require("./graph/graphBuilder");
const { computeStatus } = require("./graph/roadmapGenerator");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function listSkills() {
  return skillRepository.findAll();
}

/**
 * Lists skills for the authenticated user's selected goal. The global
 * catalogue is exposed separately through an admin-only management endpoint.
 */
async function listSkillsForUser(user) {
  if (!user.goal_id) return { skills: [], hasSelectedGoal: false };

  const [skills, knownSkillIds, progressRows, graph] = await Promise.all([
    goalRepository.findRequiredSkills(user.goal_id),
    userSkillRepository.findKnownSkillIds(user.id),
    progressRepository.findByUser(user.id),
    graphBuilder.buildGraph(),
  ]);
  const knownIds = new Set(knownSkillIds);
  const completedIds = new Set(progressRows.filter((row) => row.status === "completed").map((row) => row.skill_id));
  const inProgressIds = new Set(progressRows.filter((row) => row.status === "in_progress").map((row) => row.skill_id));

  return {
    hasSelectedGoal: true,
    skills: skills.map((skill) => ({
      ...skill,
      status: computeStatus(skill.id, { knownIds, completedIds, inProgressIds, reverseAdjacency: graph.reverseAdjacency }),
    })),
  };
}

async function getSkill(id) {
  const skill = await skillRepository.findById(id);
  if (!skill) throw httpError("Skill not found", 404);
  const [prerequisites, dependents] = await Promise.all([
    skillRepository.findPrerequisites(id),
    skillRepository.findDependents(id),
  ]);
  return { ...skill, prerequisites, dependents };
}

async function getSkillForUser(user, id) {
  if (user.role === "admin") return getSkill(id);
  if (!user.goal_id) throw httpError("Select a career goal before viewing skills", 400);

  const goalSkills = await goalRepository.findRequiredSkills(user.goal_id);
  const goalSkillIds = new Set(goalSkills.map((skill) => skill.id));
  if (!goalSkillIds.has(id)) throw httpError("Skill is not part of your selected goal", 404);

  const skill = await getSkill(id);
  return {
    ...skill,
    prerequisites: skill.prerequisites.filter((prerequisite) => goalSkillIds.has(prerequisite.id)),
    dependents: skill.dependents.filter((dependent) => goalSkillIds.has(dependent.id)),
  };
}

async function createSkill(data) {
  if (!data.name || !data.name.trim()) throw httpError("Skill name is required", 400);
  return skillRepository.create(data);
}

async function updateSkill(id, data) {
  const updated = await skillRepository.update(id, data);
  if (!updated) throw httpError("Skill not found", 404);
  return updated;
}

async function deleteSkill(id) {
  const deleted = await skillRepository.remove(id);
  if (!deleted) throw httpError("Skill not found", 404);
}

module.exports = { listSkills, listSkillsForUser, getSkill, getSkillForUser, createSkill, updateSkill, deleteSkill };
