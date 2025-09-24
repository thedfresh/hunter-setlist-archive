"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

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

export default function EventsAdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (res.ok && data.events) {
          setEvents(data.events);
        } else {
          setError("Failed to load events");
        }
      } catch {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const filtered = events.filter((e: Event) =>
    (e.displayDate || `${e.year}-${e.month || ''}-${e.day || ''}`).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Events</h1>
          <Link href="/admin/events/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Event</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Date</th>
                <th className="py-2 px-4 font-semibold">Notes</th>
                <th className="py-2 px-4 font-semibold">Created</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="py-2 px-4">{e.displayDate || `${e.year}-${e.month || ''}-${e.day || ''}`}</td>
                  <td className="py-2 px-4">{e.notes || ''}</td>
                  <td className="py-2 px-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/events/${e.id}`}>
                      <button className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-md shadow hover:bg-gray-300 transition">View/Edit</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
