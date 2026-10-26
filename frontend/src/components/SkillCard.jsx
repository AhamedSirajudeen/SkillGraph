import React from "react";
import StatusBadge from "./StatusBadge.jsx";
import { motion } from "framer-motion";

export default function SkillCard({ skill, onAction, pending = false }) {
  const canStart = skill.status === "AVAILABLE";
  const canComplete = skill.status === "IN_PROGRESS";

  return (
    <div className={`card roadmap-card ${skill.status === "AVAILABLE" ? "border-blue-300 shadow-blue-100" : ""}`}>
      <div className="roadmap-card__content">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="roadmap-card__title font-semibold text-gray-900">{skill.name}</h3>
          {skill.category && <p className="text-xs text-gray-500">{skill.category}</p>}
        </div>
        <StatusBadge status={skill.status} />
      </div>
      {skill.description && <p className="roadmap-card__description text-sm text-gray-600">{skill.description}</p>}
      {skill.status === "LOCKED" && skill.lockedReason && (
        <p className="text-xs text-amber-600">{skill.lockedReason}</p>
      )}
      </div>
      {(canStart || canComplete) && onAction && (
        <div className="roadmap-card__actions">
          {canStart && (
            <motion.button whileTap={{ scale: 0.97 }} className="btn-primary" disabled={pending} onClick={() => onAction(skill.skillId, "in_progress")}>
              {pending ? "Starting…" : "Start"}
            </motion.button>
          )}
          {canComplete && (
            <motion.button whileTap={{ scale: 0.97 }} className="btn-primary" disabled={pending} onClick={() => onAction(skill.skillId, "completed")}>
              {pending ? "Saving…" : "Mark complete"}
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
