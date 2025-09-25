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
  onContributorsChange?: (contributors: EventContributor[]) => void;
}

const EventContributorsInput: React.FC<Props> = ({ onContributorsChange }) => {
  const [contributors, setContributors] = useState<EventContributor[]>([]);
  const [allContributors, setAllContributors] = useState<Contributor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contributorId: 0, contributorName: "", description: "", notes: "", isNew: false });

  // Only fetch contributors dropdown
  useEffect(() => {
    fetch(`/api/contributors`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setAllContributors(data);
      } else if (Array.isArray(data.contributors)) {
        setAllContributors(data.contributors);
      } else {
        setAllContributors([]);
      }
    });
  }, []);

  // Call onContributorsChange when contributors change
  useEffect(() => {
    if (onContributorsChange) {
      onContributorsChange(contributors);
    }
  }, [contributors, onContributorsChange]);

  const handleSave = async () => {
    let contributorId = form.contributorId;
    let contributorName = form.contributorName;
    // If creating new contributor
    if (form.isNew && form.contributorName) {
      // Create contributor via API and get real ID
      try {
        const res = await fetch('/api/contributors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.contributorName }),
        });
        if (!res.ok) throw new Error('Failed to create contributor');
        const data = await res.json();
        if (data.contributor && data.contributor.id) {
          contributorId = data.contributor.id;
          contributorName = data.contributor.name;
          setAllContributors(prev => [...prev, { id: contributorId, name: contributorName }]);
        } else {
          throw new Error('No contributor ID returned');
        }
      } catch (err) {
        let errorMsg = '';
        if (err && typeof err === 'object' && 'message' in err) {
          errorMsg = (err as any).message;
        } else {
          errorMsg = String(err);
        }
        alert('Error creating contributor: ' + errorMsg);
        return;
      }
    }
    if (!contributorId) return;
    // Add to local contributors array
    const newEntry: EventContributor = {
      id: Date.now(),
      contributorId,
      contributorName,
      description: form.description,
      notes: form.notes,
    };
    setContributors([...contributors, newEntry]);
    setShowForm(false);
    setForm({ contributorId: 0, contributorName: "", description: "", notes: "", isNew: false });
  };

  // Remove edit/delete functionality

  return (
    <div className="mb-6">
      <h2 className="font-bold text-lg mb-2">Contributors</h2>
      <table className="w-full text-sm mb-2 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 text-left">Name</th>
            <th className="px-2 py-1 text-left">Description</th>
            <th className="px-2 py-1 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {contributors.map(c => (
            <tr key={c.id} className="border-t">
              <td className="px-2 py-1">{c.contributorName}</td>
              <td className="px-2 py-1">{c.description}</td>
              <td className="px-2 py-1">{c.notes}</td>
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
            <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => { setShowForm(false); setForm({ contributorId: 0, contributorName: "", description: "", notes: "", isNew: false }); }} type="button">Cancel</button>
          </div>
        </div>
      ) : (
        <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded" onClick={() => setShowForm(true)}>Add Contributor</button>
      )}
    </div>
  );
};

export default EventContributorsInput;
