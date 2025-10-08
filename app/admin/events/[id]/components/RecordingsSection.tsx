import React, { useEffect, useState } from "react";
import { recordingLinkPatterns } from '@/lib/recordingLinks';

interface Recording {
  id: number;
  type: { id: number; name: string };
  description: string;
  url: string;
  lmaIdentifier?: string;
  losslessLegsId?: string;
  youtubeVideoId?: string;
  shnId?: string;
  taper?: string;
  lengthMinutes?: number;
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
    description: "",
    url: "",
    lmaIdentifier: "",
    losslessLegsId: "",
    youtubeVideoId: "",
    shnId: "",
    taper: "",
    lengthMinutes: "",
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
      description: rec.description || "",
      url: rec.url || "",
      lmaIdentifier: rec.lmaIdentifier || "",
      losslessLegsId: rec.losslessLegsId || "",
      youtubeVideoId: rec.youtubeVideoId || "",
      shnId: rec.shnId || "",
      taper: rec.taper || "",
      lengthMinutes: rec.lengthMinutes != null ? String(rec.lengthMinutes) : "",
      contributorId: rec.contributor?.id ? String(rec.contributor.id) : "",
      publicNotes: rec.publicNotes || "",
      privateNotes: rec.privateNotes || "",
    });
    setShowForm(true);
  }

  function handleAdd() {
  setEditing(null);
  setForm({ typeId: "", description: "", url: "", lmaIdentifier: "", losslessLegsId: "",   youtubeVideoId: "", shnId: "", taper: "", lengthMinutes: "", contributorId: "", publicNotes: "", privateNotes: "" });
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this recording?")) return;
  await fetch(`/api/admin/events/${eventId}/recordings/${id}`, { method: "DELETE" });
    setRecordings(recs => recs.filter(r => r.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      recordingTypeId: Number(form.typeId),
      description: form.description,
      url: form.url,
      lmaIdentifier: form.lmaIdentifier || null,
      losslessLegsId: form.losslessLegsId || null,
      youtubeVideoId: form.youtubeVideoId || null,
      shnId: form.shnId || null,
      taper: form.taper || null,
      lengthMinutes: form.lengthMinutes ? Number(form.lengthMinutes) : null,
      contributorId: form.contributorId ? Number(form.contributorId) : null,
      publicNotes: form.publicNotes,
      privateNotes: form.privateNotes,
    };
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `/api/admin/events/${eventId}/recordings/${editing.id}`
      : `/api/admin/events/${eventId}/recordings`;
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg">Recordings</h2>
           <button className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1" onClick={handleAdd}>Add</button>
        </div>
      </div>
  <table className="w-full text-left border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 font-semibold">Type</th>
            <th className="py-2 px-4 font-semibold">Description</th>
            <th className="py-2 px-4 font-semibold">Links</th>
            <th className="py-2 px-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recordings.map(rec => (
            <React.Fragment key={rec.id}>
              <tr className="border-b">
                <td className="py-2 px-4">{rec.type?.name || ""}</td>
                <td className="py-2 px-4">{rec.description}</td>
                <td className="py-2 px-4">
                  {rec.lmaIdentifier && (
                    <a href={recordingLinkPatterns.lma(rec.lmaIdentifier)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">LMA</a>
                  )}
                  {rec.losslessLegsId && (
                    <a href={recordingLinkPatterns.ll(rec.losslessLegsId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">LL</a>
                  )}
                  {rec.youtubeVideoId && (
                    <a href={recordingLinkPatterns.yt(rec.youtubeVideoId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">YT</a>
                  )}
                  {rec.shnId && (
                    <a href={recordingLinkPatterns.et(rec.shnId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ET</a>
                  )}
                </td>
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
              {/* Removed LinksSection row as no longer needed */}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {showForm && (
        <form className="space-y-4 bg-gray-50 p-4 rounded shadow" onSubmit={handleSave}>
          {/* Row 1: Type, Description, Contributor */}
          <div className="flex gap-4">
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.typeId}
                onChange={e => setForm(f => ({ ...f, typeId: e.target.value }))}
                className="w-full border rounded px-2 py-1"
                required
              >
                <option value="">Select type</option>
                {recordingTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/4">
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
          {/* Row 2: URL, Length (min), Taper */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">Length (min)</label>
              <input
                type="number"
                value={form.lengthMinutes}
                onChange={e => setForm(f => ({ ...f, lengthMinutes: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">Taper</label>
              <input
                type="text"
                value={form.taper}
                onChange={e => setForm(f => ({ ...f, taper: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
          {/* Row 3: Identifiers */}
          <div className="flex gap-4">
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">LMA ID</label>
              <input
                type="text"
                value={form.lmaIdentifier}
                onChange={e => setForm(f => ({ ...f, lmaIdentifier: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">LL ID</label>
              <input
                type="text"
                value={form.losslessLegsId}
                onChange={e => setForm(f => ({ ...f, losslessLegsId: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">YouTube ID</label>
              <input
                type="text"
                value={form.youtubeVideoId}
                onChange={e => setForm(f => ({ ...f, youtubeVideoId: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div className="w-1/4">
              <label className="block text-sm font-medium mb-1">SHN ID</label>
              <input
                type="text"
                value={form.shnId}
                onChange={e => setForm(f => ({ ...f, shnId: e.target.value }))}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
          {/* Row 5: Notes */}
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