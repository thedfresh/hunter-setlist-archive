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
  // Links state for editing recording
  const [links, setLinks] = useState<any[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [linksError, setLinksError] = useState<string | null>(null);
  // Add/Edit Link form state
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [linkForm, setLinkForm] = useState({
    url: "",
    title: "",
    description: "",
    linkType: "",
    isActive: true,
  });
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

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
    // Fetch links for this recording
    setLinks([]);
    setLinksError(null);
    setLinksLoading(true);
    fetch(`/api/recordings/${rec.id}/links`)
      .then(res => res.json())
      .then(data => {
        setLinks(data.links || []);
        setLinksLoading(false);
      })
      .catch(err => {
        setLinksError("Failed to load links.");
        setLinksLoading(false);
      });
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
        className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 mb-4"
        onClick={handleAdd}
      >Add Recording</button>
      {showForm && (
        <>
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
          {/* Links display section (outside form) */}
          {editing && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Links</h3>
              {linksLoading ? (
                <p className="text-gray-500">Loading links...</p>
              ) : linksError ? (
                <p className="text-red-500">{linksError}</p>
              ) : links.length === 0 ? (
                <p className="text-gray-500">No links</p>
              ) : (
                <table className="w-full text-left border-collapse mb-2">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-1 px-2 font-semibold">URL</th>
                      <th className="py-1 px-2 font-semibold">Title</th>
                      <th className="py-1 px-2 font-semibold">Type</th>
                      <th className="py-1 px-2 font-semibold">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map(link => [
                      <tr key={link.id} className="border-b">
                        <td className="py-1 px-2">
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link.url}</a>
                        </td>
                        <td className="py-1 px-2">{link.title || ""}</td>
                        <td className="py-1 px-2">{link.linkType || ""}</td>
                        <td className="py-1 px-2">{link.isActive ? "Yes" : "No"}</td>
                        <td className="py-1 px-2">
                          <div className="flex gap-1 items-center">
                            <button
                              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
                              type="button"
                              onClick={() => {
                                setEditingLinkId(link.id);
                                setLinkForm({
                                  url: link.url,
                                  title: link.title || "",
                                  description: link.description || "",
                                  linkType: link.linkType || "",
                                  isActive: !!link.isActive,
                                });
                                setLinkError(null);
                              }}
                            >Edit</button>
                            <button
                              className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded hover:bg-red-200 border border-red-200"
                              type="button"
                              onClick={async () => {
                                if (!confirm("Delete this link?")) return;
                                setLinksLoading(true);
                                setLinksError(null);
                                await fetch(`/api/recordings/${editing.id}/links/${link.id}`, {
                                  method: "DELETE"
                                });
                                fetch(`/api/recordings/${editing.id}/links`)
                                  .then(r => r.json())
                                  .then(data => {
                                    setLinks(data.links || []);
                                    setLinksLoading(false);
                                  })
                                  .catch(err => {
                                    setLinksError("Failed to load links.");
                                    setLinksLoading(false);
                                  });
                              }}
                            >Delete</button>
                          </div>
                        </td>
                      </tr>,
                      editingLinkId === link.id && (
                        <tr key={`edit-${link.id}`}>
                          <td colSpan={5} className="bg-gray-50 p-2">
                            <form
                              className="space-y-2"
                              onSubmit={async e => {
                                e.preventDefault();
                                setLinkError(null);
                                if (!linkForm.url.trim()) {
                                  setLinkError("URL is required.");
                                  return;
                                }
                                setLinkSubmitting(true);
                                const res = await fetch(`/api/recordings/${editing.id}/links/${link.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    url: linkForm.url,
                                    title: linkForm.title,
                                    description: linkForm.description,
                                    linkType: linkForm.linkType,
                                    isActive: linkForm.isActive,
                                  }),
                                });
                                if (res.ok) {
                                  setEditingLinkId(null);
                                  setLinkForm({ url: "", title: "", description: "", linkType: "", isActive: true });
                                  setLinkSubmitting(false);
                                  setLinksLoading(true);
                                  setLinksError(null);
                                  fetch(`/api/recordings/${editing.id}/links`)
                                    .then(r => r.json())
                                    .then(data => {
                                      setLinks(data.links || []);
                                      setLinksLoading(false);
                                    })
                                    .catch(err => {
                                      setLinksError("Failed to load links.");
                                      setLinksLoading(false);
                                    });
                                } else {
                                  setLinkError("Failed to update link.");
                                  setLinkSubmitting(false);
                                }
                              }}
                            >
                              <div className="flex gap-4">
                                <div className="w-1/3">
                                  <label className="block text-sm font-medium mb-1">URL<span className="text-red-500">*</span></label>
                                  <input
                                    type="url"
                                    value={linkForm.url}
                                    onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                                    className="w-full border rounded px-2 py-1"
                                    required
                                  />
                                </div>
                                <div className="w-1/3">
                                  <label className="block text-sm font-medium mb-1">Title</label>
                                  <input
                                    type="text"
                                    value={linkForm.title}
                                    onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full border rounded px-2 py-1"
                                  />
                                </div>
                                <div className="w-1/3">
                                  <label className="block text-sm font-medium mb-1">Type</label>
                                  <input
                                    type="text"
                                    value={linkForm.linkType}
                                    onChange={e => setLinkForm(f => ({ ...f, linkType: e.target.value }))}
                                    className="w-full border rounded px-2 py-1"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-4 items-center">
                                <div className="w-2/3">
                                  <label className="block text-sm font-medium mb-1">Description</label>
                                  <textarea
                                    value={linkForm.description}
                                    onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full border rounded px-2 py-1"
                                    rows={2}
                                  />
                                </div>
                                <div className="w-1/3 flex items-center mt-6">
                                  <input
                                    type="checkbox"
                                    checked={linkForm.isActive}
                                    onChange={e => setLinkForm(f => ({ ...f, isActive: e.target.checked }))}
                                    className="mr-2"
                                    id="isActiveEdit"
                                  />
                                  <label htmlFor="isActiveEdit" className="text-sm">Active</label>
                                </div>
                              </div>
                              {linkError && <p className="text-red-500 text-sm mt-2">{linkError}</p>}
                              <div className="flex gap-2 justify-end mt-2">
                                <button
                                  type="button"
                                  className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
                                  onClick={() => {
                                    setEditingLinkId(null);
                                    setLinkError(null);
                                    setLinkForm({ url: "", title: "", description: "", linkType: "", isActive: true });
                                  }}
                                  disabled={linkSubmitting}
                                >Cancel</button>
                                <button
                                  type="submit"
                                  className="bg-green-600 text-white text-xs px-2 py-0.5 rounded hover:bg-green-700 border border-green-200"
                                  disabled={linkSubmitting}
                                >{linkSubmitting ? "Saving..." : "Save"}</button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )
                    ])}
                  </tbody>
                </table>
              )}
              {/* Add Link button and form */}
              <div className="mt-4">
                {!showAddLink ? (
                  <button
                    type="button"
                    className="bg-green-600 text-white font-semibold px-4 py-2 rounded shadow hover:bg-green-700"
                    onClick={() => {
                      setShowAddLink(true);
                      setLinkError(null);
                    }}
                  >Add Link</button>
                ) : (
                  <form
                    className="bg-white border rounded p-4 mt-2 space-y-3"
                    onSubmit={async e => {
                      e.preventDefault();
                      setLinkError(null);
                      if (!linkForm.url.trim()) {
                        setLinkError("URL is required.");
                        return;
                      }
                      setLinkSubmitting(true);
                      const res = await fetch(`/api/recordings/${editing.id}/links`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          url: linkForm.url,
                          title: linkForm.title,
                          description: linkForm.description,
                          linkType: linkForm.linkType,
                          isActive: linkForm.isActive,
                        }),
                      });
                      if (res.ok) {
                        // Refresh links
                        setLinkForm({ url: "", title: "", description: "", linkType: "", isActive: true });
                        setShowAddLink(false);
                        setLinkSubmitting(false);
                        setLinksLoading(true);
                        setLinksError(null);
                        fetch(`/api/recordings/${editing.id}/links`)
                          .then(r => r.json())
                          .then(data => {
                            setLinks(data.links || []);
                            setLinksLoading(false);
                          })
                          .catch(err => {
                            setLinksError("Failed to load links.");
                            setLinksLoading(false);
                          });
                      } else {
                        setLinkError("Failed to add link.");
                        setLinkSubmitting(false);
                      }
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="w-1/3">
                        <label className="block text-sm font-medium mb-1">URL<span className="text-red-500">*</span></label>
                        <input
                          type="url"
                          value={linkForm.url}
                          onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                          className="w-full border rounded px-2 py-1"
                          required
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                          type="text"
                          value={linkForm.title}
                          onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <input
                          type="text"
                          value={linkForm.linkType}
                          onChange={e => setLinkForm(f => ({ ...f, linkType: e.target.value }))}
                          className="w-full border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="w-2/3">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={linkForm.description}
                          onChange={e => setLinkForm(f => ({ ...f, description: e.target.value }))}
                          className="w-full border rounded px-2 py-1"
                          rows={2}
                        />
                      </div>
                      <div className="w-1/3 flex items-center mt-6">
                        <input
                          type="checkbox"
                          checked={linkForm.isActive}
                          onChange={e => setLinkForm(f => ({ ...f, isActive: e.target.checked }))}
                          className="mr-2"
                          id="isActive"
                        />
                        <label htmlFor="isActive" className="text-sm">Active</label>
                      </div>
                    </div>
                    {linkError && <p className="text-red-500 text-sm mt-2">{linkError}</p>}
                    <div className="flex gap-2 justify-end mt-2">
                      <button
                        type="button"
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200 mr-1"
                        onClick={() => {
                          setShowAddLink(false);
                          setLinkError(null);
                          setLinkForm({ url: "", title: "", description: "", linkType: "", isActive: true });
                        }}
                        disabled={linkSubmitting}
                      >Cancel</button>
                      <button
                        type="submit"
                        className="bg-green-600 text-white text-xs px-2 py-0.5 rounded hover:bg-green-700 border border-green-200"
                        disabled={linkSubmitting}
                      >{linkSubmitting ? "Saving..." : "Save"}</button>
                    </div>
                  </form>
                )}
              </div>
              {/* End Add Link button and form */}
            </div>
          )}
          {/* End links section */}
        </>
      )}
    </div>
  );
};

export default RecordingsSection;