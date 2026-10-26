/**
 * Kahn's algorithm for topological sorting over an adjacency
 * Map<id, Set<id>> (prerequisite -> dependents).
 *
 * Returns an array of node ids in a valid dependency order. Independent
 * branches may appear in either relative order (ties are broken by id for
 * deterministic output, since we never rely on database row ordering).
 *
 * Throws if the graph contains a cycle.
 */
function topologicalSort(nodeIds, adjacency) {
  const inDegree = new Map(nodeIds.map((id) => [id, 0]));

  for (const id of nodeIds) {
    for (const neighbor of adjacency.get(id) || []) {
      if (inDegree.has(neighbor)) {
        inDegree.set(neighbor, inDegree.get(neighbor) + 1);
      }
    }
  }

  let queue = nodeIds.filter((id) => inDegree.get(id) === 0).sort((a, b) => a - b);
  const order = [];

  while (queue.length > 0) {
    queue.sort((a, b) => a - b);
    const current = queue.shift();
    order.push(current);

    for (const neighbor of adjacency.get(current) || []) {
      if (!inDegree.has(neighbor)) continue;
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (order.length !== nodeIds.length) {
    const err = new Error("Graph contains a cycle; topological sort is not possible");
    err.code = "CYCLE_DETECTED";
    throw err;
  }

  return order;
}

module.exports = { topologicalSort };
