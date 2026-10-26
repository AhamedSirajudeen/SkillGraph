const test = require("node:test");
const assert = require("node:assert/strict");

const { buildGraphFromEdges } = require("../src/services/graph/graphBuilder");
const { dfsCollect, reachableFrom } = require("../src/services/graph/dfs");
const { wouldCreateCycle, hasCycle } = require("../src/services/graph/cycleDetection");
const { topologicalSort } = require("../src/services/graph/topologicalSort");
const { computeStatus, resolveRelevantSkillIds, buildLockedReason, STATUS } = require("../src/services/graph/roadmapGenerator");
const { recommendNext } = require("../src/services/graph/recommendationEngine");

// Skill ids used across tests, matching the spec's critical graph test:
// 1 HTML, 2 CSS, 3 JavaScript, 4 React, 5 Node.js, 6 Express, 7 REST API
const SKILLS = [1, 2, 3, 4, 5, 6, 7];
const EDGES = [
  [1, 2], // HTML -> CSS
  [2, 3], // CSS -> JavaScript
  [3, 4], // JavaScript -> React
  [3, 5], // JavaScript -> Node.js
  [5, 6], // Node.js -> Express
  [6, 7], // Express -> REST API
];

function namedGraph() {
  const g = buildGraphFromEdges(SKILLS, EDGES);
  const names = { 1: "HTML", 2: "CSS", 3: "JavaScript", 4: "React", 5: "Node.js", 6: "Express", 7: "REST API" };
  for (const [id, node] of g.nodes) node.name = names[id];
  return g;
}

test("topologicalSort produces a valid dependency order", () => {
  const { adjacency } = namedGraph();
  const order = topologicalSort(SKILLS, adjacency);
  const pos = (id) => order.indexOf(id);
  assert.ok(pos(1) < pos(2)); // HTML before CSS
  assert.ok(pos(2) < pos(3)); // CSS before JS
  assert.ok(pos(3) < pos(4)); // JS before React
  assert.ok(pos(3) < pos(5)); // JS before Node
  assert.ok(pos(5) < pos(6)); // Node before Express
  assert.ok(pos(6) < pos(7)); // Express before REST API
});

test("topologicalSort throws on a cyclic graph", () => {
  const { adjacency } = buildGraphFromEdges([1, 2], [[1, 2], [2, 1]]);
  assert.throws(() => topologicalSort([1, 2], adjacency), /cycle/i);
});

test("dfsCollect resolves all transitive prerequisites of REST API", () => {
  const { reverseAdjacency } = namedGraph();
  const prereqs = dfsCollect(reverseAdjacency, 7); // REST API
  // Should include REST API itself plus every transitive prerequisite
  assert.deepEqual([...prereqs].sort((a, b) => a - b), [1, 2, 3, 5, 6, 7]);
});

test("cycle detection rejects React -> HTML (would close a loop)", () => {
  const { adjacency } = namedGraph();
  // Attempting React(4) -> HTML(1): HTML can already reach React, so this closes a cycle
  assert.equal(wouldCreateCycle(adjacency, 4, 1), true);
});

test("cycle detection allows a genuinely new, non-cyclic edge", () => {
  const { adjacency } = namedGraph();
  // Git(8) -> GitHub(9) are unrelated to the existing chain; adding React -> Express is fine too
  assert.equal(wouldCreateCycle(adjacency, 4, 6), false); // React -> Express, no existing path back
});

test("cycle detection rejects a self dependency", () => {
  const { adjacency } = namedGraph();
  assert.equal(wouldCreateCycle(adjacency, 1, 1), true);
});

test("hasCycle is false for the base graph and true once a cycle is forced", () => {
  const { adjacency } = namedGraph();
  assert.equal(hasCycle(adjacency), false);
  adjacency.get(4).add(1); // force React -> HTML
  assert.equal(hasCycle(adjacency), true);
});

test("CRITICAL GRAPH TEST: dynamic unlocking exactly as specified", () => {
  const { reverseAdjacency } = namedGraph();

  // Step 1: HTML, CSS, JavaScript completed
  let completedIds = new Set([1, 2, 3]);
  let knownIds = new Set();
  let inProgressIds = new Set();

  assert.equal(computeStatus(4, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.AVAILABLE); // React
  assert.equal(computeStatus(5, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.AVAILABLE); // Node.js
  assert.equal(computeStatus(6, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.LOCKED); // Express
  assert.equal(computeStatus(7, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.LOCKED); // REST API

  // Step 2: Node.js completed
  completedIds = new Set([1, 2, 3, 5]);
  assert.equal(computeStatus(6, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.AVAILABLE); // Express

  // Step 3: Express completed
  completedIds = new Set([1, 2, 3, 5, 6]);
  assert.equal(computeStatus(7, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.AVAILABLE); // REST API
});

test("KNOWN skills satisfy prerequisites without being marked completed", () => {
  const { reverseAdjacency } = namedGraph();
  const knownIds = new Set([1, 2, 3]); // learner already knows HTML/CSS/JS
  const completedIds = new Set();
  const inProgressIds = new Set();

  assert.equal(computeStatus(3, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.KNOWN);
  assert.equal(computeStatus(4, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.AVAILABLE); // React unlocked by known JS
});

test("MULTIPLE PREREQUISITE TEST: Advanced API needs Express, Node.js and SQL all complete", () => {
  // 6 Express, 5 Node.js, 8 SQL -> 9 Advanced API
  const ids = [5, 6, 8, 9];
  const edges = [[6, 9], [5, 9], [8, 9]];
  const { reverseAdjacency } = buildGraphFromEdges(ids, edges);

  let completedIds = new Set([5, 6]); // Express + Node.js done, SQL missing
  let knownIds = new Set();
  let inProgressIds = new Set();
  assert.equal(computeStatus(9, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.LOCKED);

  completedIds = new Set([5, 6, 8]); // SQL completed too
  assert.equal(computeStatus(9, { knownIds, completedIds, inProgressIds, reverseAdjacency }), STATUS.AVAILABLE);
});

test("buildLockedReason names a single missing prerequisite", () => {
  const g = namedGraph();
  const reason = buildLockedReason(6, { // Express, only Node.js missing
    nodes: g.nodes,
    reverseAdjacency: g.reverseAdjacency,
    knownIds: new Set(),
    completedIds: new Set([1, 2, 3]),
  });
  assert.equal(reason, "Locked — Complete Node.js first.");
});

test("buildLockedReason names multiple missing prerequisites with an Oxford-less and", () => {
  const ids = [5, 6, 8, 9];
  const edges = [[6, 9], [5, 9], [8, 9]];
  const g = buildGraphFromEdges(ids, edges);
  g.nodes.get(5).name = "Node.js";
  g.nodes.get(6).name = "Express";
  g.nodes.get(8).name = "SQL";
  g.nodes.get(9).name = "Advanced API";

  const reason = buildLockedReason(9, {
    nodes: g.nodes,
    reverseAdjacency: g.reverseAdjacency,
    knownIds: new Set(),
    completedIds: new Set(),
  });
  assert.equal(reason, "Locked — Complete Express, Node.js and SQL.");
});

test("resolveRelevantSkillIds walks transitive prerequisites for all required skills", () => {
  const { reverseAdjacency } = namedGraph();
  const relevant = resolveRelevantSkillIds([4, 7], reverseAdjacency); // React + REST API required
  assert.deepEqual([...relevant].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7]);
});

test("recommendNext picks the first available goal-required skill in roadmap order", () => {
  const roadmap = [
    { skillId: 1, name: "HTML", status: STATUS.COMPLETED, isGoalRequired: true, prerequisites: [] },
    { skillId: 2, name: "CSS", status: STATUS.COMPLETED, isGoalRequired: true, prerequisites: ["HTML"] },
    { skillId: 3, name: "JavaScript", status: STATUS.COMPLETED, isGoalRequired: true, prerequisites: ["CSS"] },
    { skillId: 4, name: "React", status: STATUS.AVAILABLE, isGoalRequired: true, prerequisites: ["JavaScript"] },
    { skillId: 5, name: "Node.js", status: STATUS.AVAILABLE, isGoalRequired: true, prerequisites: ["JavaScript"] },
  ];
  const { recommendation } = recommendNext(roadmap);
  assert.equal(recommendation.skillId, 4);
  assert.match(recommendation.reason, /React/);
});

test("recommendNext returns null when nothing is available", () => {
  const roadmap = [
    { skillId: 6, name: "Express", status: STATUS.LOCKED, isGoalRequired: true, prerequisites: ["Node.js"] },
  ];
  const { recommendation } = recommendNext(roadmap);
  assert.equal(recommendation, null);
});

test("reachableFrom returns the correct downstream set", () => {
  const { adjacency } = namedGraph();
  const downstream = reachableFrom(adjacency, 3); // everything JavaScript unlocks, transitively
  assert.deepEqual([...downstream].sort((a, b) => a - b), [4, 5, 6, 7]);
});
