import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function PageTransition({ children }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="min-w-0 max-w-full"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
