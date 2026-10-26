const dependencyRepository = require("../repositories/dependencyRepository");
const skillRepository = require("../repositories/skillRepository");
const graphBuilder = require("./graph/graphBuilder");
const { wouldCreateCycle } = require("./graph/cycleDetection");

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function listDependencies() {
  return dependencyRepository.findAll();
}

async function createDependency(prerequisiteSkillId, dependentSkillId) {
  if (prerequisiteSkillId === dependentSkillId) {
    throw httpError("A skill cannot depend on itself", 400);
  }

  const [prereq, dependent] = await Promise.all([
    skillRepository.findById(prerequisiteSkillId),
    skillRepository.findById(dependentSkillId),
  ]);
  if (!prereq || !dependent) throw httpError("Both skills must exist", 404);

  const alreadyExists = await dependencyRepository.exists(prerequisiteSkillId, dependentSkillId);
  if (alreadyExists) throw httpError("This dependency already exists", 409);

  const { adjacency } = await graphBuilder.buildGraph();
  if (wouldCreateCycle(adjacency, prerequisiteSkillId, dependentSkillId)) {
    throw httpError("Dependency would create a circular dependency", 400);
  }

  return dependencyRepository.create(prerequisiteSkillId, dependentSkillId);
}

async function deleteDependency(id) {
  const deleted = await dependencyRepository.remove(id);
  if (!deleted) throw httpError("Dependency not found", 404);
}

module.exports = { listDependencies, createDependency, deleteDependency };
