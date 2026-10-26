import React, { Suspense, lazy } from "react";
import { motion, useReducedMotion } from "framer-motion";
const FloatingKnowledgeObject = lazy(() => import("./FloatingKnowledgeObject.jsx"));

export default function LuxuryAuthLayout({ children }) {
  const reduceMotion = useReducedMotion();
  return <div className="luxury-shell luxury-auth relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
    <div className="luxury-orb luxury-orb-one" /><div className="luxury-orb luxury-orb-two" />
    <Suspense fallback={null}><FloatingKnowledgeObject className="absolute -right-12 top-8 h-72 w-72 opacity-70 md:right-[10%] md:h-96 md:w-96" /></Suspense>
    <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18, rotateX: 4 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 0.55 }} className="luxury-auth-panel relative z-10 w-full max-w-sm">
      {children}
    </motion.div>
  </div>;
}
