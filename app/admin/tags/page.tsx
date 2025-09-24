"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Tag = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch("/api/tags");
        const data = await res.json();
        if (res.ok && data.tags) {
          setTags(data.tags);
        } else {
          setError("Failed to load tags.");
        }
      } catch {
        setError("Failed to load tags.");
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  const filtered = tags.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-4 text-center">
          <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tags</h1>
          <Link href="/admin/tags/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Tag</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        {loading ? (
          <div className="text-center py-8">Loading tags...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No tags found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Name</th>
                <th className="py-2 px-4 font-semibold">Description</th>
                <th className="py-2 px-4 font-semibold">Created</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tag => (
                <tr key={tag.id} className="border-b">
                  <td className="py-2 px-4">{tag.name}</td>
                  <td className="py-2 px-4">{tag.description || <span className="text-gray-400 italic">—</span>}</td>
                  <td className="py-2 px-4">{new Date(tag.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/tags/${tag.id}`}>
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
