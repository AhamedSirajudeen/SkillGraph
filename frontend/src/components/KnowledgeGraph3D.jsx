import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useReducedMotion } from "framer-motion";

const COLORS = {
  LOCKED: "#9ca3af", AVAILABLE: "#60a5fa", IN_PROGRESS: "#fbbf24",
  COMPLETED: "#4ade80", KNOWN: "#a78bfa",
};

function GraphNode({ node, position, selected, related, onSelect, reducedMotion }) {
  const group = useRef();
  const [hovered, setHovered] = useState(false);
  const color = COLORS[node.status] || COLORS.LOCKED;
  const emphasis = selected || related || hovered;

  useFrame((state) => {
    if (!group.current || reducedMotion || document.visibilityState !== "visible") return;
    group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.75 + Number(node.id)) * 0.12;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35 + Number(node.id)) * 0.12;
  });

  return (
    <group ref={group} position={position}>
      <mesh
        tabIndex={0}
        onClick={(event) => { event.stopPropagation(); onSelect(node.id); }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(node.id); }}
        scale={emphasis ? 1.2 : 1}
      >
        <sphereGeometry args={[0.38, 28, 28]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emphasis ? 0.65 : 0.2} roughness={0.28} metalness={0.35} />
      </mesh>
      {emphasis && <pointLight color={color} intensity={1.4} distance={3} />}
      <Html distanceFactor={11} center style={{ pointerEvents: "none", userSelect: "none" }}>
        <span className="graph-label">{node.name}</span>
      </Html>
    </group>
  );
}

function Connection({ source, target, active, reducedMotion }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...source), new THREE.Vector3(...target)]);
    return geometry;
  }, [source, target]);
  const traveler = useRef();
  useFrame((state) => {
    if (!traveler.current || reducedMotion || document.visibilityState !== "visible") return;
    const phase = (Math.sin(state.clock.elapsedTime * 1.25 + source[0]) + 1) / 2;
    traveler.current.position.lerpVectors(new THREE.Vector3(...source), new THREE.Vector3(...target), phase);
  });
  return (
    <group>
      <line geometry={line}>
        <lineBasicMaterial color={active ? "#7dd3fc" : "#36536d"} transparent opacity={active ? 0.9 : 0.38} />
      </line>
      {!reducedMotion && active && <mesh ref={traveler}><sphereGeometry args={[0.055, 10, 10]} /><meshBasicMaterial color="#e0f2fe" /></mesh>}
    </group>
  );
}

function Scene({ nodes, edges, selectedId, onSelect, reducedMotion }) {
  const controls = useRef();
  const positions = useMemo(() => {
    const byId = new Map();
    nodes.forEach((node, index) => {
      const angle = index * 2.399963229728653;
      const radius = 1.6 + Math.sqrt(index) * 0.95;
      byId.set(String(node.id), [Math.cos(angle) * radius, ((index % 3) - 1) * 0.9, Math.sin(angle) * radius]);
    });
    return byId;
  }, [nodes]);
  const selectedTarget = useMemo(() => {
    const position = positions.get(selectedId);
    return position ? new THREE.Vector3(...position) : new THREE.Vector3(0, 0, 0);
  }, [positions, selectedId]);
  const relatedIds = useMemo(() => new Set(edges.filter((edge) => String(edge.source) === selectedId || String(edge.target) === selectedId)
    .flatMap((edge) => [String(edge.source), String(edge.target)])), [edges, selectedId]);

  useFrame(() => {
    if (selectedId && controls.current && document.visibilityState === "visible") {
      controls.current.target.lerp(selectedTarget, reducedMotion ? 1 : 0.07);
      controls.current.update();
    }
  });

  return (
    <>
      <color attach="background" args={["#091725"]} />
      <fog attach="fog" args={["#091725", 10, 28]} />
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 6, 5]} intensity={2.2} color="#60a5fa" />
      <pointLight position={[-5, -2, 2]} intensity={1.2} color="#a78bfa" />
      {edges.map((edge) => {
        const source = positions.get(String(edge.source));
        const target = positions.get(String(edge.target));
        if (!source || !target) return null;
        const active = relatedIds.has(String(edge.source)) && relatedIds.has(String(edge.target));
        return <Connection key={`${edge.source}-${edge.target}`} source={source} target={target} active={active} reducedMotion={reducedMotion} />;
      })}
      {nodes.map((node) => <GraphNode key={node.id} node={node} position={positions.get(String(node.id))}
        selected={String(node.id) === selectedId} related={relatedIds.has(String(node.id))} onSelect={(id) => onSelect(String(id))} reducedMotion={reducedMotion} />)}
      <OrbitControls ref={controls} enablePan enableZoom enableDamping dampingFactor={0.08} minDistance={4} maxDistance={18} />
    </>
  );
}

export default function KnowledgeGraph3D({ nodes, edges, selectedId, onSelect }) {
  const reducedMotion = useReducedMotion();
  return (
    <Canvas className="h-full w-full" camera={{ position: [0, 3.5, 10], fov: 48 }} dpr={[1, 1.5]}
      fallback={<div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-300">3D graphics are unavailable on this device. Switch to Map view to explore your skills.</div>}>
      <Scene nodes={nodes} edges={edges} selectedId={selectedId} onSelect={onSelect} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
