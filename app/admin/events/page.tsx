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
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/events?includeSets=1");
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
          <div className="space-y-8">
            {filtered.map((e) => (
              <div key={e.id} className="border-b pb-6 mb-6">
                <div className="flex items-center gap-6 mb-2">
                  <div className="font-semibold text-lg">{e.displayDate || `${e.year}-${e.month || ''}-${e.day || ''}`}</div>
                  <div className="text-gray-700">
                    {e.venue ? (
                      <span>
                        {e.venue.name}
                        {e.venue.city ? `, ${e.venue.city}` : ""}
                        {e.venue.stateProvince ? `, ${e.venue.stateProvince}` : ""}
                        {e.venue.country ? `, ${e.venue.country}` : ""}
                      </span>
                    ) : "—"}
                  </div>
                  <Link href={`/admin/events/${e.id}`}>
                    <button className="bg-blue-600 text-white font-semibold py-1 px-4 rounded-md shadow hover:bg-blue-700 transition">Edit</button>
                  </Link>
                </div>
                {/* Sets and Performances */}
                {e.sets && e.sets.length > 0 && (
                  <div className="pl-4">
                    {e.sets.sort((a: any, b: any) => a.position - b.position).map((set: any) => (
                      <div key={set.id} className="mb-2">
                        <span className="font-bold mr-2">{set.setType?.displayName || set.setType?.name || "Set"}:</span>
                        {set.performances && set.performances.length > 0 ? (
                          set.performances
                            .sort((a: any, b: any) => a.performanceOrder - b.performanceOrder)
                            .map((perf: any, idx: number) => {
                              const isUncertain = perf.isUncertain;
                              const songLink = `/admin/songs/${perf.song?.id}`;
                              let display = (
                                <Link href={songLink} className={isUncertain ? "text-gray-400" : "text-blue-700 hover:underline"}>
                                  {perf.song?.title || "[Untitled]"}
                                </Link>
                              );
                              // Truncation/segue notation
                              if (perf.isTruncatedStart) display = <><span className="text-gray-500">//</span> {display}</>;
                              if (perf.isTruncatedEnd) display = <>{display} <span className="text-gray-500">//</span></>;
                              if (perf.seguesInto) {
                                const arrowClass = isUncertain ? "text-gray-400" : "text-blue-700";
                                display = <>{display} <span className={arrowClass}>&gt;</span></>;
                              }
                              // Add comma if not seguesInto, not truncated end, and not last song
                              const isLast = idx === set.performances.length - 1;
                              const needsComma = !perf.seguesInto && !perf.isTruncatedEnd && !isLast;
                              return <span key={perf.id} className="mr-2">{display}{needsComma && ","}</span>;
                            })
                        ) : (
                          <span className="text-gray-400 italic">No performances</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
