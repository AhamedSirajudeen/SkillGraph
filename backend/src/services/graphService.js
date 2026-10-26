const graphBuilder = require("./graph/graphBuilder");
const userRepository = require("../repositories/userRepository");
const goalRepository = require("../repositories/goalRepository");
const userSkillRepository = require("../repositories/userSkillRepository");
const progressRepository = require("../repositories/progressRepository");
const { computeStatus } = require("./graph/roadmapGenerator");

/**
 * Returns the full skill graph (nodes + edges) for GET /api/graph, with
 * each node annotated with the current user's dynamic status when a
 * user is provided (for React Flow rendering).
 */
async function getGraph(userId) {
  const { nodes, adjacency, reverseAdjacency } = await graphBuilder.buildGraph();

  let knownIds = new Set();
  let completedIds = new Set();
  let inProgressIds = new Set();

  let selectedSkillIds = null;

  if (userId) {
    const [user, known, progress] = await Promise.all([
      userRepository.findById(userId),
      userSkillRepository.findKnownSkillIds(userId),
      progressRepository.findByUser(userId),
    ]);

    // A graph is learner-specific: never fall back to the global catalogue
    // when the learner has not completed goal selection.
    if (!user?.goal_id) return { nodes: [], edges: [], hasSelectedGoal: false };

    const goalSkills = await goalRepository.findRequiredSkills(user.goal_id);
    selectedSkillIds = new Set(goalSkills.map((skill) => skill.id));
    knownIds = new Set(known);
    completedIds = new Set(progress.filter((p) => p.status === "completed").map((p) => p.skill_id));
    inProgressIds = new Set(progress.filter((p) => p.status === "in_progress").map((p) => p.skill_id));
  }

  const visibleNodes = [...nodes.values()].filter((skill) => !selectedSkillIds || selectedSkillIds.has(skill.id));
  const graphNodes = visibleNodes.map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    difficulty: skill.difficulty,
    estimatedHours: skill.estimated_hours,
    status: userId
      ? computeStatus(skill.id, { knownIds, completedIds, inProgressIds, reverseAdjacency })
      : undefined,
  }));

  const edges = [];
  for (const [prereqId, dependents] of adjacency.entries()) {
    if (selectedSkillIds && !selectedSkillIds.has(prereqId)) continue;
    for (const dependentId of dependents) {
      if (selectedSkillIds && !selectedSkillIds.has(dependentId)) continue;
      edges.push({ source: prereqId, target: dependentId });
    }
  }

  return { nodes: graphNodes, edges, hasSelectedGoal: true };
}

module.exports = { getGraph };
