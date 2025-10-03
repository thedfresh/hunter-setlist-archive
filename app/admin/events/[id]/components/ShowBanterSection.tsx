import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Performance {
  id: number;
  order?: number;
  performanceOrder?: number;
  song: { id: number; title: string };
  set: { id: number; position: number };
}

interface ShowBanter {
  id: number;
  performanceId: number;
  isBeforeSong: boolean | null;
  isVerbatim: boolean | null;
  banterText: string;
  performance: Performance;
}

interface Props {
  eventId: number;
}

const ShowBanterSection: React.FC<Props> = ({ eventId }) => {
  const [banter, setBanter] = useState<ShowBanter[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ShowBanter>>({});
  const [adding, setAdding] = useState(false);
  const [addData, setAddData] = useState<Partial<ShowBanter>>({});
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetchBanterAndPerformances();
  }, [eventId]);

  async function fetchBanterAndPerformances() {
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/banter`);
    if (res.ok) {
      const data = await res.json();
      setBanter(data.banter);
      setPerformances(data.performances);
    } else {
      setErrors({ form: "Failed to load banter" });
    }
    setLoading(false);
  }

  function validateBanter(data: Partial<ShowBanter>) {
    const newErrors: any = {};
    if (!data.performanceId) newErrors.performanceId = "Performance required";
    if (!data.banterText || !data.banterText.trim()) newErrors.banterText = "Banter text required";
    return newErrors;
  }

  function groupedPerformances() {
    const sets: { [setId: number]: { position: number; songs: Performance[] } } = {};
    performances.forEach((p) => {
      if (!sets[p.set.id]) sets[p.set.id] = { position: p.set.position, songs: [] };
      sets[p.set.id].songs.push(p);
    });
    // Convert to array, sort sets by position, and sort songs by performanceOrder
    return Object.values(sets)
      .map(group => ({
        position: group.position,
        songs: group.songs.sort((a, b) =>
          (a.performanceOrder ?? a.order ?? 0) - (b.performanceOrder ?? b.order ?? 0)
        ),
      }))
      .sort((a, b) => a.position - b.position);
  }

  // Handlers for add/edit/delete
  async function handleAdd() {
    const newErrors = validateBanter(addData);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/banter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        performanceId: addData.performanceId,
        isBeforeSong: addData.isBeforeSong ?? false,
        isVerbatim: addData.isVerbatim ?? false,
        banterText: addData.banterText,
      }),
    });
    if (res.ok) {
      setAddData({});
      setAdding(false);
      fetchBanterAndPerformances();
      setErrors({});
    } else {
      setErrors({ form: "Failed to add banter" });
    }
    setLoading(false);
  }

  async function handleEdit(id: number) {
    const newErrors = validateBanter(editData);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/banter/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        banterText: editData.banterText,
        isBeforeSong: editData.isBeforeSong ?? false,
        isVerbatim: editData.isVerbatim ?? false,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditData({});
      fetchBanterAndPerformances();
      setErrors({});
    } else {
      setErrors({ form: "Failed to update banter" });
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this banter?")) return;
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/banter/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchBanterAndPerformances();
      setErrors({});
    } else {
      setErrors({ form: "Failed to delete banter" });
    }
    setLoading(false);
  }

  // UI rendering
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Show Banter</h2>
      {[...banter]
        .sort((a, b) => {
          const setA = a.performance.set?.position ?? 0;
          const setB = b.performance.set?.position ?? 0;
          if (setA !== setB) return setA - setB;
          const orderA = a.performance.performanceOrder ?? a.performance.order ?? 0;
          const orderB = b.performance.performanceOrder ?? b.performance.order ?? 0;
          return orderA - orderB;
        })
        .map((banter) => (
        <div key={banter.id} className="bg-white rounded shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex gap-2">
            <select
              disabled={editingId !== banter.id}
              value={String(editingId === banter.id ? editData.isBeforeSong ?? banter.isBeforeSong ?? false : banter.isBeforeSong ?? false)}
              onChange={(e) =>
                editingId === banter.id && setEditData({ ...editData, isBeforeSong: e.target.value === "true" })
              }
              className="border rounded px-2 py-1"
            >
              <option value="true">Before</option>
              <option value="false">After</option>
            </select>
            <select
              disabled={editingId !== banter.id}
              value={editingId === banter.id ? editData.performanceId ?? banter.performanceId : banter.performanceId}
              onChange={(e) =>
                editingId === banter.id && setEditData({ ...editData, performanceId: Number(e.target.value) })
              }
              className="border rounded px-2 py-1"
            >
              {performances.length === 0 ? (
                <option value="">No performances</option>
              ) : (
                performances
                  .sort((a, b) => (a.set?.position ?? 0) - (b.set?.position ?? 0) || ((a.performanceOrder ?? a.order ?? 0) - (b.performanceOrder ?? b.order ?? 0)))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {`Set ${p.set?.position ?? "?"}: ${p.song?.title ?? "(No song)"}`}
                    </option>
                  ))
              )}
            </select>
            </div>
            <div className="flex gap-2 ml-auto">
              <label className="flex items-center gap-1 mr-2">
                <input
                  type="checkbox"
                  disabled={editingId !== banter.id}
                  checked={editingId === banter.id ? editData.isVerbatim ?? banter.isVerbatim ?? false : banter.isVerbatim ?? false}
                  onChange={(e) =>
                    editingId === banter.id && setEditData({ ...editData, isVerbatim: e.target.checked })
                  }
                />
                Verbatim
              </label>
              {editingId === banter.id ? (
                <>
                  <button
                    className="bg-blue-100 text-blue-800 font-semibold py-0.5 px-2 rounded shadow hover:bg-blue-200 transition text-sm"
                    onClick={() => handleEdit(banter.id)}
                    disabled={loading}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-200 text-gray-800 font-semibold py-0.5 px-2 rounded shadow hover:bg-gray-300 transition text-sm"
                    onClick={() => { setEditingId(null); setEditData({}); }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-blue-100 text-blue-800 font-semibold py-0.5 px-2 rounded shadow hover:bg-blue-200 transition text-sm"
                    onClick={() => { setEditingId(banter.id); setEditData(banter); }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-100 text-red-800 font-semibold py-0.5 px-2 rounded shadow hover:bg-red-200 transition text-sm"
                    onClick={() => handleDelete(banter.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            {editingId === banter.id ? (
              <textarea
                className="w-full border rounded p-2"
                value={editData.banterText ?? banter.banterText}
                onChange={(e) => setEditData({ ...editData, banterText: e.target.value })}
                rows={3}
              />
            ) : (
              <div className="w-full p-2 bg-gray-50 rounded whitespace-pre-wrap">{banter.banterText}</div>
            )}
            {editingId === banter.id && errors.banterText && (
              <div className="text-red-500 text-sm mt-1">{errors.banterText}</div>
            )}
          </div>
        </div>
      ))}
      {adding ? (
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <select
              value={String(addData.isBeforeSong ?? false)}
              onChange={(e) => setAddData({ ...addData, isBeforeSong: e.target.value === "true" })}
              className="border rounded px-2 py-1"
            >
              <option value="true">Before</option>
              <option value="false">After</option>
            </select>
            <select
              value={addData.performanceId ?? ""}
              onChange={(e) => setAddData({ ...addData, performanceId: Number(e.target.value) })}
              className="border rounded px-2 py-1"
            >
              <option value="">Select Song</option>
              {groupedPerformances().map((group) => (
                <optgroup key={group.position} label={`Set ${group.position}`}>
                  {group.songs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.song.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={addData.isVerbatim ?? false}
                onChange={(e) => setAddData({ ...addData, isVerbatim: e.target.checked })}
              />
              Verbatim
            </label>
            <button className="btn btn-primary" onClick={handleAdd} disabled={loading}>Add</button>
            <button className="btn btn-secondary" onClick={() => { setAdding(false); setAddData({}); }}>Cancel</button>
          </div>
          <div>
            <textarea
              className="w-full border rounded p-2"
              value={addData.banterText ?? ""}
              onChange={(e) => setAddData({ ...addData, banterText: e.target.value })}
              rows={3}
            />
            {errors.banterText && (
              <div className="text-red-500 text-sm mt-1">{errors.banterText}</div>
            )}
          </div>
        </div>
      ) : (
        <button
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition"
          onClick={() => setAdding(true)}
          disabled={loading}
        >
          Add Banter
        </button>
      )}
      {errors.form && <div className="text-red-500 mt-2">{errors.form}</div>}
    </section>
  );
};

export default ShowBanterSection;
