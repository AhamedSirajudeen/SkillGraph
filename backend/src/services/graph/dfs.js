/**
 * Reusable Depth-First Search utilities over an adjacency Map<id, Set<id>>.
 */

/**
 * Returns the set of all nodes reachable from startId by following `adjacency`
 * edges (not including startId itself unless there is a cycle back to it).
 */
function reachableFrom(adjacency, startId) {
  const visited = new Set();
  const stack = [startId];

  while (stack.length > 0) {
    const current = stack.pop();
    const neighbors = adjacency.get(current) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }

  return visited;
}

/**
 * Depth-first traversal that records every node visited starting from
 * startId, including startId itself. Useful for dependency resolution
 * when walking the reverseAdjacency (dependent -> prerequisites) graph.
 */
function dfsCollect(adjacency, startId) {
  const visited = new Set();

  function visit(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const neighbors = adjacency.get(nodeId) || new Set();
    for (const neighbor of neighbors) {
      visit(neighbor);
    }
  }

  visit(startId);
  return visited;
}

module.exports = { reachableFrom, dfsCollect };
