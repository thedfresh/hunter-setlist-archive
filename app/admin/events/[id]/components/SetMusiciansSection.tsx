import React, { useEffect, useState } from "react";

interface SetMusiciansSectionProps {
  setId: number;
  musicians: any[];
  instruments: any[];
}

export default function SetMusiciansSection({ setId, musicians, instruments }: SetMusiciansSectionProps) {
  const [setMusicians, setSetMusicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    musicianId: "",
    instrumentId: "",
    publicNotes: "",
    privateNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchSetMusicians() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sets/${setId}/musicians`);
        const data = await res.json();
        setSetMusicians(data.musicians || []);
      } catch {
        setError("Failed to load set musicians.");
      } finally {
        setLoading(false);
      }
    }
    fetchSetMusicians();
  }, [setId, showForm]);

  function handleEdit(mus: any) {
    setEditing(mus);
    setForm({
      musicianId: String(mus.musicianId || ""),
      instrumentId: String(mus.instrumentId || ""),
      publicNotes: mus.publicNotes || "",
      privateNotes: mus.privateNotes || "",
    });
    setShowForm(true);
  }

  function handleAdd() {
    setEditing(null);
    setForm({ musicianId: "", instrumentId: "", publicNotes: "", privateNotes: "" });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this set musician?")) return;
    setSubmitting(true);
    try {
  const res = await fetch(`/api/admin/sets/${setId}/musicians/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSetMusicians(setMusicians.filter((m) => m.id !== id));
      } else {
        setError("Failed to delete.");
      }
    } catch {
      setError("Failed to delete.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/sets/${setId}/musicians/${editing.id}` : `/api/admin/sets/${setId}/musicians`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          musicianId: Number(form.musicianId),
          instrumentId: Number(form.instrumentId),
          publicNotes: form.publicNotes,
          privateNotes: form.privateNotes,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setEditing(null);
      } else {
        setError("Failed to save.");
      }
    } catch {
      setError("Failed to save.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-50 rounded p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-base">Set Musicians</h3>
        <button className="btn btn-xs bg-blue-600 text-white px-2 py-1 rounded" onClick={handleAdd}>Add</button>
      </div>
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-1 px-2 font-semibold">Musician</th>
              <th className="py-1 px-2 font-semibold">Instrument</th>
              <th className="py-1 px-2 font-semibold">Notes</th>
              <th className="py-1 px-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {setMusicians.map((mus) => (
              <tr key={mus.id} className="border-b">
                <td className="py-1 px-2">{mus.musician?.name || "—"}</td>
                <td className="py-1 px-2">{mus.instrument?.name || "—"}</td>
                <td className="py-1 px-2">
                  {mus.publicNotes ? <span>{mus.publicNotes}</span> : <span className="text-gray-400 italic">—</span>}
                  {mus.privateNotes ? <span className="ml-2 text-xs text-gray-400">[{mus.privateNotes}]</span> : null}
                </td>
                <td className="py-1 px-2">
                  <button className="btn btn-xs bg-gray-200 px-2 py-0.5 rounded mr-2" onClick={() => handleEdit(mus)}>Edit</button>
                  <button className="btn btn-xs bg-red-600 text-white px-2 py-0.5 rounded" onClick={() => handleDelete(mus.id)} disabled={submitting}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <form className="bg-gray-100 rounded p-3 mb-2" onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-2">
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Musician</label>
              <select
                name="musicianId"
                value={form.musicianId}
                onChange={e => setForm(f => ({ ...f, musicianId: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-xs"
                required
              >
                <option value="">Select musician</option>
                {musicians.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Instrument</label>
              <select
                name="instrumentId"
                value={form.instrumentId}
                onChange={e => setForm(f => ({ ...f, instrumentId: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-xs"
                required
              >
                <option value="">Select instrument</option>
                {instruments.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Public Notes</label>
              <input
                type="text"
                name="publicNotes"
                value={form.publicNotes}
                onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-xs"
                placeholder="Notes"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Private Notes</label>
            <input
              type="text"
              name="privateNotes"
              value={form.privateNotes}
              onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder="Private notes"
            />
          </div>
          {error && <div className="text-xs text-red-500 mb-2">{error}</div>}
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn btn-xs bg-gray-300 px-2 py-1 rounded" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            <button type="submit" className="btn btn-xs bg-blue-600 text-white px-3 py-1 rounded" disabled={submitting}>{submitting ? "Saving..." : editing ? "Save Changes" : "Add Musician"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
