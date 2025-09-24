"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
type Set = {
  id: number;
  setTypeId: number;
  position: number;
  notes?: string;
  setType: { id: number; name: string; displayName: string };
};

function SetForm({ eventId, setTypes, sets, editingSet, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    setTypeId: editingSet?.setTypeId || "",
    position: editingSet?.position || (sets.length + 1),
    notes: editingSet?.notes || "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.setTypeId) newErrors.setTypeId = "Set type required.";
    if (!form.position || isNaN(Number(form.position))) newErrors.position = "Position required.";
    if (
      sets.some(
        (s: Set) =>
          Number(s.position) === Number(form.position) &&
          (!editingSet || s.id !== editingSet.id)
      )
    ) {
      newErrors.position = "Duplicate position in this event.";
    }
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    const payload = {
      setTypeId: Number(form.setTypeId),
      position: Number(form.position),
      notes: form.notes,
    };
    let res;
    if (editingSet) {
      res = await fetch(`/api/events/${eventId}/sets/${editingSet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/events/${eventId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    if (res.ok) {
      onSaved();
    } else {
      setErrors({ form: "Failed to save set." });
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">{editingSet ? "Edit Set" : "Add New Set"}</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Set Type<span className="text-red-500">*</span></label>
            <select
              name="setTypeId"
              value={form.setTypeId}
              onChange={e => setForm(f => ({ ...f, setTypeId: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.setTypeId ? "border-red-500" : "border-gray-300"}`}
              required
            >
              <option value="">Select type</option>
              {setTypes.map((t: any) => (
                <option key={t.id} value={t.id}>{t.displayName}</option>
              ))}
            </select>
            {errors.setTypeId && <p className="text-red-500 text-xs mt-1">{errors.setTypeId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position<span className="text-red-500">*</span></label>
            <input
              type="number"
              name="position"
              value={form.position}
              min={1}
              onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.position ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={2}
            />
          </div>
          {errors.form && <p className="text-red-500 text-xs mt-1">{errors.form}</p>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type Event = {
  id: number;
  year: number;
  month?: number;
  day?: number;
  displayDate?: string;
  venueId?: number;
  eventTypeId?: number;
  contentTypeId?: number;
  primaryBandId?: number;
  notes?: string;
  createdAt: string;
};


export default function EventEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [eventIds, setEventIds] = useState<number[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({
    year: "",
    month: "",
    day: "",
    displayDate: "",
    venueId: "",
    eventTypeId: "",
    contentTypeId: "",
    primaryBandId: "",
    notes: "",
  });
  const [venues, setVenues] = useState<{ id: number; name: string }[]>([]);
  const [eventTypes, setEventTypes] = useState<{ id: number; name: string }[]>([]);
  const [contentTypes, setContentTypes] = useState<{ id: number; name: string }[]>([]);
  const [bands, setBands] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // Sets management hooks
  const [sets, setSets] = useState<Set[]>([]);
  const [setTypes, setSetTypes] = useState<{ id: number; displayName: string }[]>([]);
  const [showSetForm, setShowSetForm] = useState(false);
  const [editingSet, setEditingSet] = useState<Set | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const [res, allRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/events`),
        ]);
        const data = await res.json();
        const allData = await allRes.json();
        if (res.ok && data.event) {
          setEvent(data.event);
          setForm({
            year: String(data.event.year || ""),
            month: String(data.event.month || ""),
            day: String(data.event.day || ""),
            displayDate: data.event.displayDate || "",
            venueId: String(data.event.venueId || ""),
            eventTypeId: String(data.event.eventTypeId || ""),
            contentTypeId: String(data.event.contentTypeId || ""),
            primaryBandId: String(data.event.primaryBandId || ""),
            notes: data.event.notes || "",
          });
        } else {
          setError("Event not found.");
        }
        if (allData.events) {
          setEventIds(allData.events.map((e: any) => e.id));
        }
      } catch {
        setError("Failed to load event.");
      } finally {
        setLoading(false);
      }
    }
    async function fetchDropdowns() {
      try {
        const [venuesRes, eventTypesRes, contentTypesRes, bandsRes] = await Promise.all([
          fetch("/api/venues"),
          fetch("/api/events?types=eventTypes"),
          fetch("/api/events?types=contentTypes"),
          fetch("/api/events?types=bands"),
        ]);
        const venuesData = await venuesRes.json();
        const eventTypesData = await eventTypesRes.json();
        const contentTypesData = await contentTypesRes.json();
        const bandsData = await bandsRes.json();
        setVenues(venuesData.venues || []);
        setEventTypes(eventTypesData.eventTypes || []);
        setContentTypes(contentTypesData.contentTypes || []);
        setBands(bandsData.bands || []);
      } catch {
        // fallback: leave dropdowns empty
      }
    }
    fetchEvent();
    fetchDropdowns();
  }, [id]);

  useEffect(() => {
    async function fetchSetsAndTypes() {
      const setsRes = await fetch(`/api/events/${id}/sets`);
      const setsData = await setsRes.json();
      setSets(setsData.sets || []);
      const typesRes = await fetch("/api/set-types");
      const typesData = await typesRes.json();
      setSetTypes(typesData.setTypes || []);
    }
    fetchSetsAndTypes();
  }, [id, showSetForm]);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.year || isNaN(Number(form.year))) newErrors.year = "Year is required and must be a number.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setError(newErrors.year || "");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Failed to update event.");
      }
    } catch {
      setError("Failed to update event.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/events");
      } else {
        setDeleteError("Failed to delete event.");
      }
    } catch {
      setDeleteError("Failed to delete event.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading event...</div>;
  }
  if (!event) {
    return <div className="p-8 text-center text-red-500">Event not found.</div>;
  }

  // Previous/Next navigation
  const currentIndex = eventIds.findIndex(eid => String(eid) === id);
  const prevId = currentIndex > 0 ? eventIds[currentIndex - 1] : null;
  const nextId = currentIndex < eventIds.length - 1 ? eventIds[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Event</h1>
        <div className="mb-4 flex justify-between items-center">
          <Link href="/admin/events" className="text-blue-600 hover:underline font-semibold">Back to Events</Link>
          <div className="flex gap-2">
            {prevId && (
              <Link href={`/admin/events/${prevId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">← Previous</Link>
            )}
            {nextId && (
              <Link href={`/admin/events/${nextId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Next →</Link>
            )}
          </div>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year<span className="text-red-500">*</span></label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
                required
              />
            </div>
            <div className="w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="number"
                name="month"
                value={form.month}
                onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>
            <div className="w-1/6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <input
                type="number"
                name="day"
                value={form.day}
                onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Date</label>
              <input
                type="text"
                name="displayDate"
                value={form.displayDate}
                onChange={e => setForm(f => ({ ...f, displayDate: e.target.value }))}
                className="w-full border rounded-md px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. July 4, 1985"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <select
              name="venueId"
              value={form.venueId}
              onChange={e => setForm(f => ({ ...f, venueId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select venue</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              name="eventTypeId"
              value={form.eventTypeId}
              onChange={e => setForm(f => ({ ...f, eventTypeId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select type</option>
              {eventTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select
              name="contentTypeId"
              value={form.contentTypeId}
              onChange={e => setForm(f => ({ ...f, contentTypeId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select content</option>
              {contentTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Band</label>
            <select
              name="primaryBandId"
              value={form.primaryBandId}
              onChange={e => setForm(f => ({ ...f, primaryBandId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select band</option>
              {bands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded-md px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={5}
              placeholder="Additional notes..."
            />
          </div>
          {success && <p className="text-green-600 text-sm mb-2">Event updated successfully!</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <hr className="my-8" />
        {/* Sets Section */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">Sets</h2>
        <div className="mb-4">
          <button
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition"
            onClick={() => { setEditingSet(null); setShowSetForm(true); }}
          >
            Add New Set
          </button>
        </div>
        <table className="w-full text-left border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 font-semibold">Type</th>
              <th className="py-2 px-4 font-semibold">Position</th>
              <th className="py-2 px-4 font-semibold">Notes</th>
              <th className="py-2 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sets.sort((a, b) => a.position - b.position).map(set => (
              <tr key={set.id} className="border-b">
                <td className="py-2 px-4">{set.setType.displayName}</td>
                <td className="py-2 px-4">{set.position}</td>
                <td className="py-2 px-4">{set.notes || <span className="text-gray-400 italic">—</span>}</td>
                <td className="py-2 px-4">
                  <button
                    className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-md shadow hover:bg-gray-300 transition mr-2"
                    onClick={() => { setEditingSet(set); setShowSetForm(true); }}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white font-semibold py-1 px-3 rounded-md shadow hover:bg-red-700 transition"
                    onClick={async () => {
                      if (confirm("Delete this set?")) {
                        await fetch(`/api/events/${id}/sets/${set.id}`, { method: "DELETE" });
                        setSets(sets.filter(s => s.id !== set.id));
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showSetForm && (
          <SetForm
            eventId={id}
            setTypes={setTypes}
            sets={sets}
            editingSet={editingSet}
            onClose={() => setShowSetForm(false)}
            onSaved={() => setShowSetForm(false)}
          />
        )}
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-md shadow hover:bg-red-700 transition disabled:opacity-50"
          disabled={submitting}
        >
          Delete Event
        </button>
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
        <p className="mt-6 text-gray-500 text-xs">Created: {new Date(event.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
