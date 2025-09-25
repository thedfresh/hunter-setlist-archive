import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Performance {
  id: number;
  order: number;
  song: { id: number; name: string };
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
  performances: Performance[];
}

const ShowDialogSection: React.FC<Props> = ({ eventId, performances }) => {
  const [dialogs, setDialogs] = useState<ShowDialog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ShowDialog>>({});
  const [adding, setAdding] = useState(false);
  const [addData, setAddData] = useState<Partial<ShowDialog>>({});
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetchDialogs();
  }, [eventId]);

  async function fetchDialogs() {
    setLoading(true);
    const res = await fetch(`/api/events/${eventId}/dialog`);
    if (res.ok) {
      const data = await res.json();
      setDialogs(data);
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
      fetchDialogs();
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
      fetchDialogs();
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
      fetchDialogs();
      setErrors({});
    } else {
      setErrors({ form: "Failed to delete dialog" });
    }
    setLoading(false);
  }

  // UI rendering
  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4">Show Dialog</h2>
      {dialogs.map((dialog) => (
        <div key={dialog.id} className="bg-white rounded shadow p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
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
              {groupedPerformances().map((group) => (
                <optgroup key={group.position} label={`Set ${group.position}`}>
                  {group.songs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.song.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <label className="flex items-center gap-1">
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
                <button className="btn btn-primary" onClick={() => handleEdit(dialog.id)} disabled={loading}>Save</button>
                <button className="btn btn-secondary" onClick={() => { setEditingId(null); setEditData({}); }}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => { setEditingId(dialog.id); setEditData(dialog); }}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(dialog.id)} disabled={loading}>Delete</button>
              </>
            )}
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
                      {p.song.name}
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
        <button className="btn btn-primary" onClick={() => setAdding(true)} disabled={loading}>Add Dialog</button>
      )}
      {errors.form && <div className="text-red-500 mt-2">{errors.form}</div>}
    </section>
  );
};

export default ShowDialogSection;
