const { reachableFrom } = require("./dfs");

/**
 * Determines whether adding an edge prerequisiteId -> dependentId to the
 * given adjacency map (prerequisite -> dependents) would create a cycle.
 *
 * A cycle is created if dependentId can already reach prerequisiteId,
 * because adding prerequisiteId -> dependentId would then close a loop.
 */
function wouldCreateCycle(adjacency, prerequisiteId, dependentId) {
  if (prerequisiteId === dependentId) return true;
  const reachableFromDependent = reachableFrom(adjacency, dependentId);
  return reachableFromDependent.has(prerequisiteId);
}

/**
 * Detects whether the graph (as currently built) contains any cycle at all.
 * Uses the classic white/gray/black DFS coloring approach.
 */
function hasCycle(adjacency) {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map();
  for (const id of adjacency.keys()) color.set(id, WHITE);

  function visit(nodeId) {
    color.set(nodeId, GRAY);
    for (const neighbor of adjacency.get(nodeId) || []) {
      if (color.get(neighbor) === GRAY) return true;
      if (color.get(neighbor) === WHITE && visit(neighbor)) return true;
    }
    color.set(nodeId, BLACK);
    return false;
  }

  for (const id of adjacency.keys()) {
    if (color.get(id) === WHITE) {
      if (visit(id)) return true;
    }
  }
  return false;
}

module.exports = { wouldCreateCycle, hasCycle };
