import React, { Suspense, lazy, useEffect, useMemo, useState, useCallback } from "react";
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState } from "reactflow";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "reactflow/dist/style.css";
import api from "../services/api";
import EmptyState from "../components/EmptyState.jsx";

const KnowledgeGraph3D = lazy(() => import("../components/KnowledgeGraph3D.jsx"));

const STATUS_COLORS = {
  LOCKED: { bg: "#f3f4f6", border: "#d1d5db", text: "#6b7280" },
  AVAILABLE: { bg: "#dbeafe", border: "#60a5fa", text: "#1d4ed8" },
  IN_PROGRESS: { bg: "#fef3c7", border: "#fbbf24", text: "#92400e" },
  COMPLETED: { bg: "#dcfce7", border: "#4ade80", text: "#15803d" },
  KNOWN: { bg: "#ede9fe", border: "#a78bfa", text: "#6d28d9" },
};

function layoutNodes(nodes, edges) {
  // Simple layered layout: longest-path depth from any root per node.
  const idToNode = new Map(nodes.map((n) => [n.id, n]));
  const incoming = new Map(nodes.map((n) => [n.id, 0]));
  const adjacency = new Map(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
  });

  const depth = new Map(nodes.map((n) => [n.id, 0]));
  const queue = nodes.filter((n) => incoming.get(n.id) === 0).map((n) => n.id);
  const visited = new Set(queue);

  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) {
      depth.set(next, Math.max(depth.get(next), depth.get(current) + 1));
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  const columnCounts = {};
  return nodes.map((n) => {
    const col = depth.get(n.id) || 0;
    columnCounts[col] = (columnCounts[col] || 0) + 1;
    const row = columnCounts[col] - 1;
    return { ...n, position: { x: col * 220, y: row * 120 } };
  });
}

export default function SkillGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasSelectedGoal, setHasSelectedGoal] = useState(true);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const reduceMotion = useReducedMotion();
  const [view, setView] = useState(() => (!reduceMotion && typeof window !== "undefined" && window.WebGLRenderingContext ? "3d" : "2d"));

  const load = useCallback(() => {
    setLoading(true);
    api.get("/graph").then(({ data }) => {
      const { nodes: rawNodes, edges: rawEdges } = data.data;
      setHasSelectedGoal(data.data.hasSelectedGoal);
      setRawNodes(rawNodes);
      setRawEdges(rawEdges);

      const flowNodesBase = rawNodes.map((n) => ({
        id: String(n.id),
        data: { label: n.name },
        position: { x: 0, y: 0 },
      }));
      const flowEdges = rawEdges.map((e) => ({
        id: `${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        animated: false,
      }));

      const laidOut = layoutNodes(flowNodesBase, flowEdges);
      const styledNodes = laidOut.map((n, i) => {
        const status = rawNodes[i]?.status || "LOCKED";
        const colors = STATUS_COLORS[status] || STATUS_COLORS.LOCKED;
        return {
          ...n,
          style: {
            background: colors.bg,
            border: `2px solid ${colors.border}`,
            color: colors.text,
            borderRadius: 10,
            padding: 8,
            fontSize: 12,
            fontWeight: 600,
          },
        };
      });

      setNodes(styledNodes);
      setEdges(flowEdges);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [setNodes, setEdges]);

  useEffect(() => { load(); }, [load]);

  const legend = useMemo(
    () => Object.entries(STATUS_COLORS).map(([status, c]) => ({ status, color: c.border })),
    []
  );
  const selectedSkill = rawNodes.find((node) => String(node.id) === selectedId);
  const searchResults = search.trim()
    ? rawNodes.filter((node) => node.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5)
    : [];

  if (error) return <p className="text-gray-600">{error}</p>;
  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!hasSelectedGoal) {
    return <EmptyState title="Choose a career goal first" description="Select a goal to see the skills and dependencies in your learning graph." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Skill graph</h1>
          <p className="mt-1 text-sm text-gray-500">Explore your live learning dependencies.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          {legend.map((l) => (
            <span key={l.status} className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              {l.status.replace("_", " ")}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a skill..." aria-label="Find a skill in the graph" />
          {searchResults.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              {searchResults.map((node) => <button key={node.id} onClick={() => { setSelectedId(String(node.id)); setSearch(""); }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-brand-50">{node.name}</button>)}
            </div>
          )}
        </div>
        <div className="inline-flex self-start rounded-lg bg-gray-100 p-1 text-sm">
          <button className={`rounded-md px-3 py-1.5 transition ${view === "3d" ? "bg-white text-brand-700 shadow-sm" : "text-gray-600"}`} onClick={() => setView("3d")}>3D view</button>
          <button className={`rounded-md px-3 py-1.5 transition ${view === "2d" ? "bg-white text-brand-700 shadow-sm" : "text-gray-600"}`} onClick={() => setView("2d")}>Map view</button>
        </div>
      </div>
      <div className="card relative h-[70vh] overflow-hidden p-0">
        {view === "3d" ? (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-slate-300">Preparing 3D graph...</div>}>
            <KnowledgeGraph3D nodes={rawNodes} edges={rawEdges} selectedId={selectedId} onSelect={setSelectedId} />
          </Suspense>
        ) : (
          <ReactFlow
            nodes={nodes.map((node) => ({ ...node, selected: node.id === selectedId }))}
            edges={edges}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
        <AnimatePresence>
          {selectedSkill && (
            <motion.aside initial={reduceMotion ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }}
              transition={{ duration: 0.22 }} className="absolute bottom-3 right-3 z-10 w-64 rounded-xl border border-white/20 bg-slate-950/90 p-4 text-white shadow-2xl backdrop-blur">
              <button className="absolute right-2 top-1 text-lg text-slate-300 hover:text-white" onClick={() => setSelectedId(null)} aria-label="Close skill details">×</button>
              <p className="pr-5 text-xs font-semibold uppercase tracking-wider text-sky-300">{selectedSkill.status.replace("_", " ")}</p>
              <h2 className="mt-1 font-semibold">{selectedSkill.name}</h2>
              <p className="mt-1 text-xs text-slate-300">{selectedSkill.category || "Learning skill"} · {selectedSkill.difficulty}</p>
              <p className="mt-3 text-xs text-slate-300">Select nearby nodes to trace prerequisite and dependent relationships.</p>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
