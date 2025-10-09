"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Event = {
  id: number;
  year?: number;
  month?: number;
  day?: number;
  displayDate?: string;
  slug?: string;
  primaryBand?: { name: string };
};

type Venue = {
  id: number;
  name: string;
  context?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  isUncertain?: boolean;
  createdAt: string;
  events?: Event[];
};

export default function VenueEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [venue, setVenue] = useState<Venue | null>(null);
  const [form, setForm] = useState({
    name: "",
    context: "",
    city: "",
    stateProvince: "",
    country: "",
    publicNotes: "",
    privateNotes: "",
    isUncertain: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchVenue() {
      try {
        const res = await fetch(`/api/venues/${id}`);
        const data = await res.json();
        if (res.ok && data.venue) {
          setVenue(data.venue);
          setForm({
            name: data.venue.name,
            context: data.venue.context || "",
            city: data.venue.city || "",
            stateProvince: data.venue.stateProvince || "",
            country: data.venue.country || "",
            publicNotes: data.venue.publicNotes || "",
            privateNotes: data.venue.privateNotes || "",
            isUncertain: !!data.venue.isUncertain,
          });
        } else {
          setError("Venue not found.");
        }
      } catch {
        setError("Failed to load venue.");
      } finally {
        setLoading(false);
      }
    }
    fetchVenue();
  }, [id]);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = "Venue name is required.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setError(newErrors.name || "");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/venues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Failed to update venue.");
      }
    } catch {
      setError("Failed to update venue.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this venue?")) return;
    setSubmitting(true);
    try {
  const res = await fetch(`/api/admin/venues/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/venues");
      } else {
        setDeleteError("Failed to delete venue.");
      }
    } catch {
      setDeleteError("Failed to delete venue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading venue...</div>;
  }
  if (!venue) {
    return <div className="p-8 text-center text-red-500">Venue not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Venue</h1>
        <div className="mb-4 text-center">
          <Link href="/admin/venues" className="text-blue-600 hover:underline font-semibold">Back to Venues</Link>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
            <input
              type="text"
              name="context"
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input
              type="text"
              name="stateProvince"
              value={form.stateProvince}
              onChange={e => setForm(f => ({ ...f, stateProvince: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Public Notes</label>
              <textarea
                name="publicNotes"
                value={form.publicNotes}
                onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                rows={2}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Private Notes</label>
              <textarea
                name="privateNotes"
                value={form.privateNotes}
                onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                rows={2}
              />
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isUncertain"
              checked={form.isUncertain}
              onChange={e => setForm(f => ({ ...f, isUncertain: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-700">Is Uncertain?</label>
          </div>
          {success && <p className="text-green-600 text-sm mb-2">Venue updated successfully!</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <hr className="my-8" />
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-md shadow hover:bg-red-700 transition disabled:opacity-50"
          disabled={submitting}
        >
          Delete Venue
        </button>
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}

        {/* List of events at this venue */}
        {venue.events && venue.events.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">Events at this Venue</h2>
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Band</th>
                  <th>Link</th>
                </tr>
              </thead>
              <tbody>
                {venue.events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.displayDate || `${event.year ?? ''}-${event.month ?? ''}-${event.day ?? ''}`}</td>
                    <td>{event.primaryBand?.name || ''}</td>
                    <td>
                      <Link href={`/event/${event.slug}`} className="text-blue-600 hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-gray-500 text-xs">Created: {new Date(venue.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
