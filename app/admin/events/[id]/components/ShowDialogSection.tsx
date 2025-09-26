import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Performance {
  id: number;
  order?: number;
  performanceOrder?: number;
  song: { id: number; title: string };
  set: { id: number; position: number };
}

interface ShowDialog {
  id: number;
  performanceId: number;
  isBeforeSong: boolean | null;
  isVerbatim: boolean | null;
  dialogText: string;
  performance: Performance;
}

interface Props {
  eventId: number;
}

const ShowDialogSection: React.FC<Props> = ({ eventId }) => {
  const [dialogs, setDialogs] = useState<ShowDialog[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ShowDialog>>({});
  const [adding, setAdding] = useState(false);
  const [addData, setAddData] = useState<Partial<ShowDialog>>({});
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetchDialogAndPerformances();
  }, [eventId]);

  async function fetchDialogAndPerformances() {
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/dialog`);
    if (res.ok) {
      const data = await res.json();
      setDialogs(data.dialogs);
      setPerformances(data.performances);
    } else {
      setErrors({ form: "Failed to load dialog" });
    }
    setLoading(false);
  }

  function validateDialog(data: Partial<ShowDialog>) {
    const newErrors: any = {};
    if (!data.performanceId) newErrors.performanceId = "Performance required";
    if (!data.dialogText || !data.dialogText.trim()) newErrors.dialogText = "Dialog text required";
    return newErrors;
  }

  function groupedPerformances() {
    const sets: { [setId: number]: { position: number; songs: Performance[] } } = {};
    performances.forEach((p) => {
      if (!sets[p.set.id]) sets[p.set.id] = { position: p.set.position, songs: [] };
      sets[p.set.id].songs.push(p);
    });
    return Object.values(sets).sort((a, b) => a.position - b.position);
  }

  // Handlers for add/edit/delete
  async function handleAdd() {
    const newErrors = validateDialog(addData);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/dialog`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        performanceId: addData.performanceId,
        isBeforeSong: addData.isBeforeSong ?? false,
        isVerbatim: addData.isVerbatim ?? false,
        dialogText: addData.dialogText,
      }),
    });
    if (res.ok) {
      setAddData({});
      setAdding(false);
      fetchDialogAndPerformances();
      setErrors({});
    } else {
      setErrors({ form: "Failed to add dialog" });
    }
    setLoading(false);
  }

  async function handleEdit(id: number) {
    const newErrors = validateDialog(editData);
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/dialog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dialogText: editData.dialogText,
        isBeforeSong: editData.isBeforeSong ?? false,
        isVerbatim: editData.isVerbatim ?? false,
      }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditData({});
      fetchDialogAndPerformances();
      setErrors({});
    } else {
      setErrors({ form: "Failed to update dialog" });
    }
    setLoading(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this dialog?")) return;
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/dialog/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchDialogAndPerformances();
      setErrors({});
    } else {
      setErrors({ form: "Failed to delete dialog" });
    }
    setLoading(false);
  }

  // UI rendering
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Show Dialogue</h2>
      {[...dialogs]
        .sort((a, b) => {
          const setA = a.performance.set?.position ?? 0;
          const setB = b.performance.set?.position ?? 0;
          if (setA !== setB) return setA - setB;
          const orderA = a.performance.performanceOrder ?? a.performance.order ?? 0;
          const orderB = b.performance.performanceOrder ?? b.performance.order ?? 0;
          return orderA - orderB;
        })
        .map((dialog) => (
        <div key={dialog.id} className="bg-white rounded shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 flex gap-2">
            <select
              disabled={editingId !== dialog.id}
              value={String(editingId === dialog.id ? editData.isBeforeSong ?? dialog.isBeforeSong ?? false : dialog.isBeforeSong ?? false)}
              onChange={(e) =>
                editingId === dialog.id && setEditData({ ...editData, isBeforeSong: e.target.value === "true" })
              }
              className="border rounded px-2 py-1"
            >
              <option value="true">Before</option>
              <option value="false">After</option>
            </select>
            <select
              disabled={editingId !== dialog.id}
              value={editingId === dialog.id ? editData.performanceId ?? dialog.performanceId : dialog.performanceId}
              onChange={(e) =>
                editingId === dialog.id && setEditData({ ...editData, performanceId: Number(e.target.value) })
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
                  disabled={editingId !== dialog.id}
                  checked={editingId === dialog.id ? editData.isVerbatim ?? dialog.isVerbatim ?? false : dialog.isVerbatim ?? false}
                  onChange={(e) =>
                    editingId === dialog.id && setEditData({ ...editData, isVerbatim: e.target.checked })
                  }
                />
                Verbatim
              </label>
              {editingId === dialog.id ? (
                <>
                  <button
                    className="bg-blue-100 text-blue-800 font-semibold py-0.5 px-2 rounded shadow hover:bg-blue-200 transition text-sm"
                    onClick={() => handleEdit(dialog.id)}
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
                    onClick={() => { setEditingId(dialog.id); setEditData(dialog); }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-100 text-red-800 font-semibold py-0.5 px-2 rounded shadow hover:bg-red-200 transition text-sm"
                    onClick={() => handleDelete(dialog.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            {editingId === dialog.id ? (
              <textarea
                className="w-full border rounded p-2"
                value={editData.dialogText ?? dialog.dialogText}
                onChange={(e) => setEditData({ ...editData, dialogText: e.target.value })}
                rows={3}
              />
            ) : (
              <div className="w-full p-2 bg-gray-50 rounded whitespace-pre-wrap">{dialog.dialogText}</div>
            )}
            {editingId === dialog.id && errors.dialogText && (
              <div className="text-red-500 text-sm mt-1">{errors.dialogText}</div>
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
              value={addData.dialogText ?? ""}
              onChange={(e) => setAddData({ ...addData, dialogText: e.target.value })}
              rows={3}
            />
            {errors.dialogText && (
              <div className="text-red-500 text-sm mt-1">{errors.dialogText}</div>
            )}
          </div>
        </div>
      ) : (
        <button
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition"
          onClick={() => setAdding(true)}
          disabled={loading}
        >
          Add Dialog
        </button>
      )}
      {errors.form && <div className="text-red-500 mt-2">{errors.form}</div>}
    </section>
  );
};

export default ShowDialogSection;
