const graphBuilder = require("./graphBuilder");
const { dfsCollect } = require("./dfs");
const { topologicalSort } = require("./topologicalSort");

const STATUS = {
  KNOWN: "KNOWN",
  LOCKED: "LOCKED",
  AVAILABLE: "AVAILABLE",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
};

/**
 * Resolves the full set of skills relevant to a roadmap: the goal's
 * required skills plus every transitive prerequisite of those skills.
 */
function resolveRelevantSkillIds(requiredSkillIds, reverseAdjacency) {
  const relevant = new Set();
  for (const skillId of requiredSkillIds) {
    const prereqs = dfsCollect(reverseAdjacency, skillId);
    for (const id of prereqs) relevant.add(id);
  }
  return relevant;
}

/**
 * Computes the dynamic status of a single skill given the learner's
 * known skills, completed/in-progress skills, and its prerequisites.
 */
function computeStatus(skillId, { knownIds, completedIds, inProgressIds, reverseAdjacency }) {
  if (completedIds.has(skillId)) return STATUS.COMPLETED;
  if (knownIds.has(skillId)) return STATUS.KNOWN;
  if (inProgressIds.has(skillId)) return STATUS.IN_PROGRESS;

  const prerequisites = reverseAdjacency.get(skillId) || new Set();
  const allSatisfied = [...prerequisites].every(
    (prereqId) => completedIds.has(prereqId) || knownIds.has(prereqId)
  );

  return allSatisfied ? STATUS.AVAILABLE : STATUS.LOCKED;
}

/**
 * Builds the reasons a locked skill is locked, naming its incomplete
 * prerequisites, e.g. "Locked — Complete Express, SQL and Node.js."
 */
function buildLockedReason(skillId, { nodes, reverseAdjacency, knownIds, completedIds }) {
  const prerequisites = [...(reverseAdjacency.get(skillId) || [])]
    .filter((id) => !completedIds.has(id) && !knownIds.has(id))
    .map((id) => nodes.get(id)?.name)
    .filter(Boolean);

  if (prerequisites.length === 0) return null;
  if (prerequisites.length === 1) return `Locked — Complete ${prerequisites[0]} first.`;

  const last = prerequisites[prerequisites.length - 1];
  const rest = prerequisites.slice(0, -1).join(", ");
  return `Locked — Complete ${rest} and ${last}.`;
}

/**
 * Generates a personalized roadmap for a learner pursuing a given goal.
 *
 * Steps (per spec):
 *  1. Get goal, 2. required skills, 3. known skills, 4. completed skills,
 *  5. build graph, 6. resolve dependencies, 7. detect cycles (graph is
 *  validated at write-time so this just guards against inconsistency),
 *  8. topologically sort, 9. keep known/completed visible with their
 *  status (per spec they are not "removed", just marked), 10. compute
 *  statuses, 11. return the roadmap.
 */
async function generateRoadmap({ goalId, requiredSkillIds, knownSkillIds, progressRows }) {
  const { nodes, adjacency, reverseAdjacency } = await graphBuilder.buildGraph();

  const knownIds = new Set(knownSkillIds);
  const completedIds = new Set(progressRows.filter((p) => p.status === "completed").map((p) => p.skill_id));
  const inProgressIds = new Set(progressRows.filter((p) => p.status === "in_progress").map((p) => p.skill_id));

  const relevantIds = resolveRelevantSkillIds(requiredSkillIds, reverseAdjacency);
  const orderedIds = topologicalSort([...relevantIds], adjacency).filter((id) => relevantIds.has(id));

  const roadmap = orderedIds.map((skillId) => {
    const status = computeStatus(skillId, { knownIds, completedIds, inProgressIds, reverseAdjacency });
    const skill = nodes.get(skillId);
    return {
      skillId,
      name: skill?.name,
      description: skill?.description,
      category: skill?.category,
      difficulty: skill?.difficulty,
      estimatedHours: skill?.estimated_hours,
      status,
      isGoalRequired: requiredSkillIds.includes(skillId),
      prerequisites: [...(reverseAdjacency.get(skillId) || [])].map((id) => nodes.get(id)?.name),
      lockedReason: status === STATUS.LOCKED
        ? buildLockedReason(skillId, { nodes, reverseAdjacency, knownIds, completedIds })
        : null,
    };
  });

  const total = roadmap.length;
  const completedCount = roadmap.filter((s) => s.status === STATUS.COMPLETED || s.status === STATUS.KNOWN).length;

  return {
    goalId,
    roadmap,
    progressSummary: {
      total,
      completed: completedCount,
      percentComplete: total === 0 ? 0 : Math.round((completedCount / total) * 100),
    },
  };
}

module.exports = { generateRoadmap, computeStatus, resolveRelevantSkillIds, buildLockedReason, STATUS };
