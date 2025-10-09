"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Venue = {
  id: number;
  name: string;
  context?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  isUncertain?: boolean;
  createdAt: string;
  _count?: { events: number };
};

export default function VenuesAdminPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch("/api/venues");
        const data = await res.json();
        if (res.ok && data.venues) {
          setVenues(data.venues);
        } else {
          setError("Failed to load venues");
        }
      } catch {
        setError("Failed to load venues");
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  const filtered = venues.filter((v: Venue) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.context && v.context.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...filtered].sort((a, b) => {
    let aVal: any, bVal: any;
    if (sortKey === "name") {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortKey === "location") {
      aVal = [a.city, a.stateProvince, a.country].filter(Boolean).join(", ").toLowerCase();
      bVal = [b.city, b.stateProvince, b.country].filter(Boolean).join(", ").toLowerCase();
    } else if (sortKey === "showCount") {
      aVal = a._count?.events ?? 0;
      bVal = b._count?.events ?? 0;
    } else {
      return 0;
    }
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Venues</h1>
          <Link href="/admin/venues/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Venue</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search venues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        {loading ? (
          <div className="text-center py-8">Loading venues...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No venues found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold cursor-pointer" onClick={() => handleSort("name")}>Name{sortKey === "name" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}</th>
                <th className="py-2 px-4 font-semibold cursor-pointer" onClick={() => handleSort("location")}>Location{sortKey === "location" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}</th>
                <th className="py-2 px-4 font-semibold cursor-pointer" onClick={() => handleSort("showCount")}>Show Count{sortKey === "showCount" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}</th>
                <th className="py-2 px-4 font-semibold">Uncertain?</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="py-2 px-4">
                    {v.name}
                    {v.context ? `, ${v.context}` : ""}
                  </td>
                  <td className="py-2 px-4">
                    {[v.city, v.stateProvince, v.country].filter(Boolean).join(", ")}
                  </td>
                  <td className="py-2 px-4">{v._count?.events ?? 0}</td>
                  <td className="py-2 px-4">{v.isUncertain ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/venues/${v.id}`}>
                      <button className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-md shadow hover:bg-gray-300 transition">Edit</button>
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
// ...existing code...
