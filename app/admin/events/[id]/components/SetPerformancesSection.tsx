
import React, { useState, useEffect } from "react";
import PerformanceForm from './PerformanceForm';
import { Performance } from '@/lib/types';

interface SetPerformancesSectionProps {
  set: any;
  songs: any[];
  musicians: any[];
  instruments: any[];
  onPerformancesChanged?: () => void;
}

const SetPerformancesSection: React.FC<SetPerformancesSectionProps> = ({ set, songs, musicians, instruments, onPerformancesChanged }) => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [showPerformanceForm, setShowPerformanceForm] = useState(false);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);

  useEffect(() => {
    async function fetchPerformances() {
      const res = await fetch(`/api/sets/${set.id}/performances`);
      const data = await res.json();
      setPerformances(data.performances || []);
    }
    fetchPerformances();
  }, [set.id, showPerformanceForm]);

  async function handleReorder(performanceId: number, direction: "up" | "down") {
    const idx = performances.findIndex((p) => p.id === performanceId);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= performances.length) return;
    const updated = [...performances];
    // Swap orders
    const tempOrder = updated[idx].performanceOrder;
    updated[idx].performanceOrder = updated[targetIdx].performanceOrder;
    updated[targetIdx].performanceOrder = tempOrder;
    // Update both in backend
    await Promise.all([
      fetch(`/api/sets/${set.id}/performances/${updated[idx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated[idx]),
      }),
      fetch(`/api/sets/${set.id}/performances/${updated[targetIdx].id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated[targetIdx]),
      }),
    ]);
    setPerformances([...updated]);
    if (onPerformancesChanged) onPerformancesChanged();
  }

  async function handleDelete(performanceId: number) {
    if (!confirm("Delete this performance?")) return;
    await fetch(`/api/sets/${set.id}/performances/${performanceId}`, {
      method: "DELETE",
    });
    setPerformances(performances.filter((p) => p.id !== performanceId));
    if (onPerformancesChanged) onPerformancesChanged();
  }

  return (
    <div className="mb-8 text-sm">
      <table className="w-full text-left border-collapse mb-4 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 font-semibold">Order</th>
            <th className="py-2 px-4 font-semibold">Song</th>
            <th className="py-2 px-4 font-semibold">Notation</th>
            <th className="py-2 px-4 font-semibold">Guest Musicians</th>
            <th className="py-2 px-4 font-semibold">Notes</th>
            <th className="py-2 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {performances
            .sort((a, b) => a.performanceOrder - b.performanceOrder)
            .map((p, idx) => (
              <tr key={p.id} className="border-b">
                <td className="py-2 px-4 flex gap-2 items-center">
                  {p.performanceOrder}
                  <button
                    className="text-blue-600 px-1"
                    disabled={idx === 0}
                    onClick={() => handleReorder(p.id, "up")}
                  >
                    ↑
                  </button>
                  <button
                    className="text-blue-600 px-1"
                    disabled={idx === performances.length - 1}
                    onClick={() => handleReorder(p.id, "down")}
                  >
                    ↓
                  </button>
                </td>
                <td className="py-2 px-4">{p.song.title}</td>
                <td className="py-2 px-4">
                  <div className="flex gap-2">
                    {p.isUncertain && (
                      <span className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded text-xs font-semibold" title="Uncertain">Uncertain</span>
                    )}
                    {p.seguesInto && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Segue
                      </span>
                    )}
                    {p.isTruncatedStart && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        Trunc. Start
                      </span>
                    )}
                    {p.isTruncatedEnd && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                        Trunc. End
                      </span>
                    )}
                    {p.hasCuts && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                        Cuts
                      </span>
                    )}
                    {p.isPartial && (
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                        Partial
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2 px-4">
                  {p.performanceMusicians.length > 0 ? (
                    <ul className="list-disc ml-4">
                      {p.performanceMusicians.map((pm) => (
                        <li key={pm.id}>
                          {pm.musician.name}
                          {pm.instrument ? ` (${pm.instrument.name})` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
                <td className="py-2 px-4">{p.notes || <span className="text-gray-400 italic">—</span>}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-md shadow hover:bg-gray-300 transition mr-2"
                    onClick={() => {
                      setEditingPerformance(p);
                      setShowPerformanceForm(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white font-semibold py-1 px-3 rounded-md shadow hover:bg-red-700 transition"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <button
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition"
        onClick={() => {
          setEditingPerformance(null);
          setShowPerformanceForm(true);
        }}
      >
        Add Performance
      </button>
      {showPerformanceForm && (
        <PerformanceForm
          setId={set.id}
          songs={songs}
          musicians={musicians}
          instruments={instruments}
          performances={performances}
          editingPerformance={editingPerformance}
          onClose={() => setShowPerformanceForm(false)}
          onSaved={() => setShowPerformanceForm(false)}
        />
      )}
    </div>
  );
};

export default SetPerformancesSection;
