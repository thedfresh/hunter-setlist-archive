import React, { useEffect, useState } from "react";

export interface EventContributor {
  id: number;
  contributorId: number;
  contributorName: string;
  description: string;
  notes: string;
}

interface Contributor {
  id: number;
  name: string;
}

interface Props {
  eventId: number;
}

const EventContributorsSection: React.FC<Props> = ({ eventId }) => {
  const [contributors, setContributors] = useState<EventContributor[]>([]);
  const [allContributors, setAllContributors] = useState<Contributor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contributorId: 0, contributorName: "", description: "", notes: "", isNew: false });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/events/${eventId}/contributors`).then(r => r.json()).then(setContributors);
    fetch(`/api/contributors`).then(r => r.json()).then(data => {
      // If API returns { contributors: [...] } or just [...]
      if (Array.isArray(data)) {
        setAllContributors(data);
      } else if (Array.isArray(data.contributors)) {
        setAllContributors(data.contributors);
      } else {
        setAllContributors([]);
      }
    });
  }, [eventId]);

  const handleSave = async () => {
    let contributorId = form.contributorId;
    // If creating new contributor
    if (form.isNew && form.contributorName) {
      const res = await fetch("/api/contributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.contributorName }),
      });
      if (res.ok) {
        const newContributor = await res.json();
        contributorId = newContributor.id;
        setAllContributors(prev => [...prev, newContributor]);
      } else {
        alert("Failed to create contributor");
        return;
      }
    }
    if (!contributorId) return;
    const res = await fetch(`/api/events/${eventId}/contributors${editingId ? `/${editingId}` : ""}`, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contributorId,
        description: form.description,
        notes: form.notes,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setContributors(editingId
        ? contributors.map(c => c.id === editingId ? updated : c)
        : [...contributors, updated]
      );
      setShowForm(false);
      setEditingId(null);
      setForm({ contributorId: 0, contributorName: "", description: "", notes: "", isNew: false });
    }
  };

  const handleEdit = (c: EventContributor) => {
    setForm({ contributorId: c.contributorId, contributorName: "", description: c.description, notes: c.notes, isNew: false });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/events/${eventId}/contributors/${id}`, { method: "DELETE" });
    if (res.ok) setContributors(contributors.filter(c => c.id !== id));
  };

  return (
    <div className="mb-6">
      <h2 className="font-bold text-lg mb-2">Contributors</h2>
      <table className="w-full text-sm mb-2 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 text-left">Name</th>
            <th className="px-2 py-1 text-left">Description</th>
            <th className="px-2 py-1 text-left">Notes</th>
            <th className="px-2 py-1 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contributors.map(c => (
            <tr key={c.id} className="border-t">
              <td className="px-2 py-1">{c.contributorName}</td>
              <td className="px-2 py-1">{c.description}</td>
              <td className="px-2 py-1">{c.notes}</td>
              <td className="px-2 py-1">
                <div className="flex gap-1 items-center">
                  <button
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded hover:bg-blue-200 border border-blue-200"
                    onClick={() => handleEdit(c)}
                    type="button"
                  >Edit</button>
                  <button
                    className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded hover:bg-red-200 border border-red-200"
                    onClick={() => handleDelete(c.id)}
                    type="button"
                  >Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showForm ? (
        <div className="border p-2 rounded mb-2">
          <select
            className="border rounded px-2 py-1 mb-1 w-full"
            value={form.isNew ? "new" : form.contributorId}
            onChange={e => {
              if (e.target.value === "new") {
                setForm(f => ({ ...f, isNew: true, contributorId: 0 }));
              } else {
                setForm(f => ({ ...f, isNew: false, contributorId: Number(e.target.value), contributorName: "" }));
              }
            }}
          >
            <option key="select" value={0}>Select contributor...</option>
            {allContributors.map(c => (
              <option key={"contrib-" + c.id} value={c.id}>{c.name}</option>
            ))}
            <option key="new" value="new">Create New Contributor</option>
          </select>
          {form.isNew && (
            <input
              className="border rounded px-2 py-1 mb-1 w-full"
              placeholder="Contributor Name"
              value={form.contributorName}
              onChange={e => setForm(f => ({ ...f, contributorName: e.target.value }))}
            />
          )}
          <input
            className="border rounded px-2 py-1 mb-1 w-full"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <textarea
            className="border rounded px-2 py-1 mb-1 w-full"
            placeholder="Notes"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleSave} type="button">Save</button>
            <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => { setShowForm(false); setEditingId(null); setForm({ contributorId: 0, contributorName: "", description: "", notes: "", isNew: false }); }} type="button">Cancel</button>
          </div>
        </div>
      ) : (
        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded" onClick={() => setShowForm(true)}>Add Contributor</button>
      )}
    </div>
  );
};

export default EventContributorsSection;
