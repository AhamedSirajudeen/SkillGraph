const skillRepository = require("../../repositories/skillRepository");
const dependencyRepository = require("../../repositories/dependencyRepository");

/**
 * Builds an in-memory directed-graph representation of all skills and
 * their prerequisite relationships from the database.
 *
 * Returned shape:
 * {
 *   nodes: Map<skillId, skillRow>,
 *   adjacency: Map<skillId, Set<skillId>>   // prerequisite -> dependents
 *   reverseAdjacency: Map<skillId, Set<skillId>> // dependent -> prerequisites
 * }
 */
async function buildGraph() {
  const skills = await skillRepository.findAll();
  const dependencies = await dependencyRepository.findAll();

  const nodes = new Map();
  const adjacency = new Map();
  const reverseAdjacency = new Map();

  for (const skill of skills) {
    nodes.set(skill.id, skill);
    adjacency.set(skill.id, new Set());
    reverseAdjacency.set(skill.id, new Set());
  }

  for (const dep of dependencies) {
    if (!adjacency.has(dep.prerequisite_skill_id) || !nodes.has(dep.dependent_skill_id)) continue;
    adjacency.get(dep.prerequisite_skill_id).add(dep.dependent_skill_id);
    reverseAdjacency.get(dep.dependent_skill_id).add(dep.prerequisite_skill_id);
  }

  return { nodes, adjacency, reverseAdjacency };
}

/**
 * Builds a graph from raw edge lists without touching the database.
 * Useful for testing and for cycle-detection on hypothetical edges.
 */
function buildGraphFromEdges(skillIds, edges) {
  const nodes = new Map(skillIds.map((id) => [id, { id }]));
  const adjacency = new Map(skillIds.map((id) => [id, new Set()]));
  const reverseAdjacency = new Map(skillIds.map((id) => [id, new Set()]));

  for (const [prereq, dependent] of edges) {
    if (!adjacency.has(prereq) || !adjacency.has(dependent)) continue;
    adjacency.get(prereq).add(dependent);
    reverseAdjacency.get(dependent).add(prereq);
  }

  return { nodes, adjacency, reverseAdjacency };
}

module.exports = { buildGraph, buildGraphFromEdges };
