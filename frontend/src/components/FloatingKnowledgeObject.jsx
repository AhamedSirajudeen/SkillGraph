import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";

function Sculpture({ reducedMotion }) {
  const group = useRef();
  useFrame((state) => {
    if (group.current && !reducedMotion && document.visibilityState === "visible") {
      group.current.rotation.y = state.clock.elapsedTime * 0.18;
    }
  });
  return <group ref={group} rotation={[0.35, 0, 0.2]}>
    <Float speed={reducedMotion ? 0 : 1.1} rotationIntensity={0.28} floatIntensity={0.45}>
      <mesh><icosahedronGeometry args={[1.25, 2]} /><meshStandardMaterial color="#d6b56d" metalness={0.9} roughness={0.2} /></mesh>
      <mesh scale={1.42}><icosahedronGeometry args={[1.25, 1]} /><meshBasicMaterial color="#f5df9c" transparent opacity={0.1} wireframe /></mesh>
    </Float>
  </group>;
}

export default function FloatingKnowledgeObject({ className = "" }) {
  const reducedMotion = useReducedMotion();
  return <div aria-hidden="true" className={`pointer-events-none ${className}`}>
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4], fov: 42 }} fallback={null}>
      <ambientLight intensity={0.65} /><pointLight position={[3, 3, 3]} intensity={3} color="#f5df9c" />
      <pointLight position={[-3, -2, 2]} intensity={1.4} color="#60a5fa" /><Sculpture reducedMotion={reducedMotion} />
    </Canvas>
  </div>;
}
