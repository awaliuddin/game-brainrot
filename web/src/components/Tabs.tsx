"use client";
import React, { useState } from "react";

export type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
};

export default function Tabs({ tabs, defaultTabId, className }: TabsProps) {
  const [activeId, setActiveId] = useState<string>(defaultTabId ?? tabs[0]?.id);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 border-b border-black/10 dark:border-white/15 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors " +
              (activeId === t.id
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-foreground")
            }
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {active?.content ?? <div className="text-sm opacity-70">No content</div>}
      </div>
    </div>
  );
}
