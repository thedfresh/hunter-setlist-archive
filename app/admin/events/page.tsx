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

  const filtered = events
    .slice()
    .sort((a: any, b: any) => {
      // Sort by year, then month, then day
      const ay = Number(a.year), by = Number(b.year);
      if (ay !== by) return ay - by;
      const am = Number(a.month || 0), bm = Number(b.month || 0);
      if (am !== bm) return am - bm;
      const ad = Number(a.day || 0), bd = Number(b.day || 0);
      return ad - bd;
    })
    .filter((e: Event) =>
      (e.displayDate || `${e.year}-${e.month || ''}-${e.day || ''}`).toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
  <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
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
    <div className="space-y-4">
            {filtered.map((e) => {
              // Collect unique guests for footnotes
              const guestMap = new Map(); // key: "name|instrument", value: {name, instrument, idx}
              let guestSeq = 1;
              // For each set/performance, collect guests
              e.sets?.forEach((set: any) => {
                set.performances?.forEach((perf: any) => {
                  perf.performanceMusicians?.forEach((pm: any) => {
                    if (pm.musician && pm.instrument) {
                      const key = `${pm.musician.name}|${pm.instrument.name}`;
                      if (!guestMap.has(key)) {
                        guestMap.set(key, { name: pm.musician.name, instrument: pm.instrument.name, idx: guestSeq });
                        guestSeq++;
                      }
                    }
                  });
                });
              });
              // Helper to get guest footnote indices for a performance
              function getGuestIndices(perf: any) {
                const indices: number[] = [];
                perf.performanceMusicians?.forEach((pm: any) => {
                  if (pm.musician && pm.instrument) {
                    const key = `${pm.musician.name}|${pm.instrument.name}`;
                    if (guestMap.has(key)) {
                      indices.push(guestMap.get(key).idx);
                    }
                  }
                });
                // Only unique indices per performance
                return Array.from(new Set(indices));
              }
              const eventTextClass = e.isUncertain ? "text-gray-500" : "";
              return (
                <div key={e.id} className={`border-b pt-3 pb-4 mb-2 px-4 ${!e.verified ? 'bg-gray-50' : ''} ${eventTextClass}`}>
                  {/* Band name */}
                  {e.primaryBand?.name && (
                    <div className="text-sm font-medium text-gray-600 mb-1">{e.primaryBand.name}</div>
                  )}
                  <div className="flex items-center gap-4 mb-1">
                    <div className={`font-medium text-base ${eventTextClass}`}>{e.displayDate || `${e.year}-${String(e.month || '').padStart(2, '0')}-${String(e.day || '').padStart(2, '0')}`}</div>
                    <div className={e.isUncertain ? "text-gray-500 text-sm" : "text-gray-700 text-sm"}>
                      {e.venue ? (
                        <span>
                          {e.venue.name}
                          {e.venue.context ? ` (${e.venue.context})` : ""}
                          {e.venue.city ? `, ${e.venue.city}` : ""}
                          {e.venue.stateProvince ? `, ${e.venue.stateProvince}` : ""}
                          {e.venue.country ? `, ${e.venue.country}` : ""}
                          {e.showTiming ? ` (${e.showTiming})` : ""}
                        </span>
                      ) : "—"}
                    </div>
                    <div className="flex-1 flex justify-end">
                      <Link href={`/admin/events/${e.id}`}>  
                        <button className="bg-blue-600 text-white font-semibold py-1 px-2 rounded shadow hover:bg-blue-700 transition text-xs">Edit</button>
                      </Link>
                    </div>
                  </div>
                  {/* Sets and Performances */}
                  {e.sets && e.sets.length > 0 && (
                    <div className="pl-4">
                      {e.sets.sort((a: any, b: any) => a.position - b.position).map((set: any) => (
                        <div key={set.id} className="mb-2">
                          <span className={`font-bold mr-2 ${eventTextClass}`}>{set.setType?.displayName || set.setType?.name || "Set"}:</span>
                          {set.performances && set.performances.length > 0 ? (
                            set.performances
                              .sort((a: any, b: any) => a.performanceOrder - b.performanceOrder)
                              .map((perf: any, idx: number) => {
                                const isUncertain = perf.isUncertain || set.isUncertain || e.isUncertain;
                                const songLink = `/admin/songs/${perf.song?.id}`;
                                let display = (
                                  <Link href={songLink} className={isUncertain ? "text-gray-500" : "text-blue-700 hover:underline"}>
                                    {perf.song?.title || "[Untitled]"}
                                  </Link>
                                );
                                // Truncation/segue notation
                                if (perf.isTruncatedStart) display = <><span className="text-gray-500">//</span> {display}</>;
                                if (perf.isTruncatedEnd) display = <>{display} <span className="text-gray-500">//</span></>;
                                if (perf.seguesInto) {
                                  const arrowClass = isUncertain ? "text-gray-500" : "text-blue-700";
                                  display = <>{display} <span className={arrowClass}>&gt;</span></>;
                                }
                                // Guest footnote indicators
                                const guestIndices = getGuestIndices(perf);
                                // Add comma if not seguesInto, not truncated end, and not last song
                                const isLast = idx === set.performances.length - 1;
                                const needsComma = !perf.seguesInto && !perf.isTruncatedEnd && !isLast;
                                return (
                                  <span key={perf.id} className={`mr-2 text-sm ${eventTextClass}`}>
                                    {display}
                                    {guestIndices.length > 0 && guestIndices.map(i => (
                                      <sup key={i} style={{ fontSize: "0.75em", top: "-0.5em", position: "relative" }}>[{i}]</sup>
                                    ))}
                                    {needsComma && ","}
                                  </span>
                                );
                              })
                          ) : (
                            <span className="text-gray-500 italic">No performances</span>
                          )}
                        </div>
                      ))}
                      {/* Guest footnotes below all sets */}
                      {guestMap.size > 0 && (
                        <div className={`mt-4 text-sm ${eventTextClass}`}>
                          {Array.from(guestMap.values()).map(g => (
                            <div key={g.idx} className="mb-1">
                              <span className="font-semibold">[{g.idx}]</span> {g.name} on {g.instrument}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
