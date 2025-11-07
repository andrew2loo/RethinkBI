import React from "react";
import { useUIStore } from "../state/ui.js";

export function NavRail(): JSX.Element {
  const { nav, setNav } = useUIStore();

  const items = [
    { id: "report" as const, label: "Report", icon: "📊" },
    { id: "data" as const, label: "Data", icon: "📁" },
    { id: "model" as const, label: "Model", icon: "🔗" }
  ];

  return (
    <div className="w-[72px] bg-[var(--panel)] border-r border-[var(--border)] flex flex-col items-center py-4">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setNav(item.id)}
          className={`w-14 h-14 flex flex-col items-center justify-center rounded-lg mb-2 transition-colors ${
            nav === item.id
              ? "bg-[var(--accent)] text-white"
              : "hover:bg-[var(--bg)] text-[var(--muted)]"
          }`}
          title={item.label}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

