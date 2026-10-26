import React from "react";

const STYLES = {
  LOCKED: "bg-gray-100 text-gray-500",
  AVAILABLE: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  KNOWN: "bg-purple-100 text-purple-700",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || "bg-gray-100 text-gray-600"}`}>{status?.replace("_", " ")}</span>;
}
