import React, { useEffect, useState } from "react";
import { Event } from "@/lib/types";

interface Recording {
  id: number;
  type: { id: number; name: string };
  sourceInfo: string;
  url: string;
  contributor: { id: number; name: string };
  notes: string;
}

interface Props {
  eventId: number;
}

const RecordingsSection: React.FC<Props> = ({ eventId }) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingTypes, setRecordingTypes] = useState<{ id: number; name: string; sourceType?: string }[]>([]);
  const [contributors, setContributors] = useState<{ id: number; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Recording | null>(null);
  const [form, setForm] = useState({
    typeId: "",
    sourceInfo: "",
    contributorId: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [recTypesRes, contribRes, recsRes] = await Promise.all([
          fetch("/api/recording-types"),
          fetch("/api/contributors"),
          fetch(`/api/events/${eventId}/recordings`),
        ]);
        const recTypes = await recTypesRes.json();
        if (!recTypes.recordingTypes || !Array.isArray(recTypes.recordingTypes)) {
          // eslint-disable-next-line no-console
          console.error("No recordingTypes from API", recTypes);
        }
        setRecordingTypes(recTypes.recordingTypes || []);
        const contribs = await contribRes.json();
        setContributors(contribs.contributors || []);
        const recs = await recsRes.json();
        setRecordings(recs.recordings || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching dropdowns in RecordingsSection", err);
      }
    }
    fetchAll();
  }, [eventId, showForm]);

  function handleEdit(rec: Recording) {
    setEditing(rec);
    setForm({
      typeId: rec.type?.id ? String(rec.type.id) : "",
      sourceInfo: rec.sourceInfo,
      contributorId: rec.contributor?.id ? String(rec.contributor.id) : "",
      notes: rec.notes,
    });
    setShowForm(true);
  }

  function handleAdd() {
    setEditing(null);
    setForm({ typeId: "", sourceInfo: "", contributorId: "", notes: "" });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this recording?")) return;
    await fetch(`/api/events/${eventId}/recordings/${id}`, { method: "DELETE" });
    setRecordings(recs => recs.filter(r => r.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      recordingTypeId: form.typeId,
      sourceInfo: form.sourceInfo,
      contributorId: form.contributorId,
      notes: form.notes,
    };
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `/api/events/${eventId}/recordings/${editing.id}`
      : `/api/events/${eventId}/recordings`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setShowForm(false);
    } else {
      setError("Failed to save recording.");
    }
    setSubmitting(false);
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Recordings</h2>
      <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 font-semibold">Type</th>
            <th className="py-2 px-4 font-semibold">Source Info</th>
            <th className="py-2 px-4 font-semibold">Contributor</th>
            <th className="py-2 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
            {recordings.map(rec => (
              <tr key={rec.id} className="border-b">
                <td className="py-2 px-4">{rec.type?.name || ""}</td>
                <td className="py-2 px-4">{rec.sourceInfo}</td>
                <td className="py-2 px-4">{rec.contributor?.name || ""}</td>
                <td className="py-2 px-4">
                <button
                  className="bg-gray-200 text-gray-800 font-semibold py-0.5 px-2 rounded hover:bg-gray-300 mr-2 text-sm"
                  onClick={() => handleEdit(rec)}
                >Edit</button>
                <button
                  className="bg-red-600 text-white font-semibold py-0.5 px-2 rounded hover:bg-red-700 text-sm"
                  onClick={() => handleDelete(rec.id)}
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 mb-4"
        onClick={handleAdd}
      >Add Recording</button>
      {showForm && (
        <form className="space-y-4 bg-gray-50 p-4 rounded shadow" onSubmit={handleSave}>
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.typeId}
                onChange={e => setForm(f => ({ ...f, typeId: e.target.value }))}
                className="w-full border rounded px-2 py-1"
                required
                disabled={recordingTypes.length === 0}
              >
                <option value="">{recordingTypes.length === 0 ? "No types found" : "Select type"}</option>
                {recordingTypes.length > 0 && recordingTypes.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.sourceType ? ` (${t.sourceType})` : ""}
                  </option>
                ))}
              </select>
              {recordingTypes.length === 0 && (
                <p className="text-red-500 text-xs mt-1">No recording types found. Please add types in the database.</p>
              )}
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Source Info</label>
              <input
                type="text"
                value={form.sourceInfo}
                onChange={e => setForm(f => ({ ...f, sourceInfo: e.target.value }))}
                className="w-full border rounded px-2 py-1"
                required
              />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-medium mb-1">Contributor</label>
              <select
                value={form.contributorId}
                onChange={e => setForm(f => ({ ...f, contributorId: e.target.value }))}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="">Select contributor</option>
                {contributors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded px-2 py-1"
              rows={2}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >Cancel</button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={submitting}
            >{submitting ? "Saving..." : "Save"}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RecordingsSection;