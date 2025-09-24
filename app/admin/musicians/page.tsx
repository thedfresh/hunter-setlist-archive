"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

type Musician = {
  id: number;
  name: string;
  isUncertain: boolean;
  createdAt: string;
  defaultInstruments?: { instrument: { id: number; name: string } }[];
};

export default function MusiciansPage() {
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMusicians() {
      try {
        const res = await fetch("/api/musicians");
        const data = await res.json();
        if (res.ok && data.musicians) {
          setMusicians(data.musicians);
        } else {
          setError("Failed to load musicians");
        }
      } catch {
        setError("Failed to load musicians");
      } finally {
        setLoading(false);
      }
    }
    fetchMusicians();
  }, []);

  const filtered = musicians.filter((m: Musician) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add Home link above main content

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Musicians</h1>
          <Link href="/admin/musicians/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Musician</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search musicians..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        {loading ? (
          <div className="text-center py-8">Loading musicians...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No musicians found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Name</th>
                <th className="py-2 px-4 font-semibold">Uncertain?</th>
                <th className="py-2 px-4 font-semibold">Created</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="py-2 px-4">
                    <div className="flex flex-col gap-1">
                      <span>{m.name}</span>
                      {m.defaultInstruments && m.defaultInstruments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {m.defaultInstruments.map(di => (
                            <span key={di.instrument.id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {di.instrument.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">{m.isUncertain ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/musicians/${m.id}`}>
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
