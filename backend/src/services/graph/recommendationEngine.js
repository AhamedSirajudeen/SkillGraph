const { STATUS } = require("./roadmapGenerator");

/**
 * Deterministic recommendation engine. No randomness, no external AI calls.
 *
 * Ordering (per spec):
 *  1. Required by the selected goal
 *  2. Topological roadmap order (roadmap is already in that order)
 *  3. Currently AVAILABLE
 *  4. Not known
 *  5. Not completed
 */
function recommendNext(roadmap) {
  const candidate = roadmap.find(
    (item) => item.isGoalRequired && item.status === STATUS.AVAILABLE
  );

  if (!candidate) {
    // Fall back to any available skill (transitive prerequisite, not
    // directly required by the goal but still unlocked) before giving up.
    const fallback = roadmap.find((item) => item.status === STATUS.AVAILABLE);
    if (!fallback) return { recommendation: null };
    return {
      recommendation: {
        skillId: fallback.skillId,
        name: fallback.name,
        reason: `${fallback.name} is now available and is a prerequisite toward your goal.`,
      },
    };
  }

  const justUnlockedBy = candidate.prerequisites?.length
    ? `${candidate.prerequisites.join(", ")} completed and ${candidate.name} is now available.`
    : `${candidate.name} has no prerequisites and is available to start.`;

  return {
    recommendation: {
      skillId: candidate.skillId,
      name: candidate.name,
      reason: justUnlockedBy,
    },
  };
}

module.exports = { recommendNext };
