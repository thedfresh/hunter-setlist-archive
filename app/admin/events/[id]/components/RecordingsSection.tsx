import React, { useEffect, useState } from "react";
import { Event } from "@/lib/types";

interface Recording {
  id: number;
  type: { id: number; name: string };
  sourceInfo: string;
  url: string;
  contributor: { id: number; name: string };
  publicNotes?: string;
  privateNotes?: string;
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
    publicNotes: "",
    privateNotes: "",
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
      publicNotes: rec.publicNotes || "",
      privateNotes: rec.privateNotes || "",
    });
    setShowForm(true);
  }

  function handleAdd() {
  setEditing(null);
  setForm({ typeId: "", sourceInfo: "", contributorId: "", publicNotes: "", privateNotes: "" });
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
      publicNotes: form.publicNotes,
      privateNotes: form.privateNotes,
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
            <th className="py-2 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recordings.map(rec => (
            <tr key={rec.id} className="border-b">
              <td className="py-2 px-4">{rec.type?.name || ""}</td>
              <td className="py-2 px-4">{rec.sourceInfo}</td>
              <td className="py-2 px-4">{rec.contributor?.name || ""}</td>
              <td className="py-2 px-4 text-right">
                <button
                  className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
                  onClick={() => handleEdit(rec)}
                  type="button"
                >Edit</button>
                <button
                  className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded hover:bg-red-200 border border-red-200"
                  onClick={() => handleDelete(rec.id)}
                  type="button"
                >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
        onClick={handleAdd}
      >Add Recording</button>
      {showForm && (
        <form className="space-y-4 bg-gray-50 p-4 rounded shadow" onSubmit={handleSave}>
          <div className="flex gap-4">
            <div className="w-1/4">
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
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Source Info</label>
              <input
                type="text"
                value={form.sourceInfo}
                onChange={e => setForm(f => ({ ...f, sourceInfo: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Contributor</label>
              <select
                value={form.contributorId}
                onChange={e => setForm(f => ({ ...f, contributorId: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select contributor</option>
                {contributors.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Public Notes</label>
              <textarea
                value={form.publicNotes}
                onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))}
                className="w-full border rounded px-2 py-1"
                rows={2}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Private Notes</label>
              <textarea
                value={form.privateNotes}
                onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
                className="w-full border rounded px-2 py-1"
                rows={2}
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >Cancel</button>
            <button
              type="submit"
              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
              disabled={submitting}
            >{submitting ? "Saving..." : "Save"}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RecordingsSection;