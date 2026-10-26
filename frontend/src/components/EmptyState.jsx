import React from "react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center py-12 text-center">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
