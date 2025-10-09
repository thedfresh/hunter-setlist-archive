"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export function BandFilterChips({ bandCounts, selectedKeys }: {
  bandCounts: { key: string, label: string, className: string, count: number }[],
  selectedKeys: string[],
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChipClick(key: string, e: React.MouseEvent<HTMLDivElement>) {
    const ALL_NON_ALL_KEYS = bandCounts.filter(b => b.key !== 'all').map(b => b.key);
    // If clicking 'all', show everything (no types param)
    if (key === 'all') {
      router.push('/event');
      return;
    }
    const isModifier = e.metaKey || e.ctrlKey;
    let newKeys: string[] = [];
    if (!isModifier) {
      // Single-select: just this key
      newKeys = [key];
    } else {
      // Multi-select: toggle key
      const current = new Set(selectedKeys.filter(k => k !== 'all'));
      if (current.has(key)) {
        current.delete(key);
      } else {
        current.add(key);
      }
      newKeys = Array.from(current);
    }
    // If all non-all keys are selected, treat as 'all'
    if (newKeys.length === ALL_NON_ALL_KEYS.length) {
      router.push('/event');
      return;
    }
  // Build types param
  const params = new URLSearchParams(searchParams.toString());
  params.delete('bands'); // Remove old param if present
  params.set('types', newKeys.join(","));
  params.delete('page'); // Reset paging to first page
  router.push(`/event?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {bandCounts.map(b => {
        const active = selectedKeys.includes(b.key);
        return (
          <React.Fragment key={b.key}>
            <div
              className={`card px-3 py-1 text-xs font-semibold cursor-pointer transition hover:scale-105 ${b.className} ${active ? "" : "opacity-40 grayscale"}`}
              onClick={(e) => handleChipClick(b.key, e)}
            >
              {b.label} ({b.count})
            </div>
            {b.key === 'all' && <div key={`break-${b.key}`} className="basis-full h-0" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
