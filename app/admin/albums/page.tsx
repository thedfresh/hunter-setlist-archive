"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Album = {
  id: number;
  title: string;
  artist?: string;
  releaseYear?: number;
  isOfficial: boolean;
  notes?: string;
  createdAt: string;
};

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await fetch("/api/albums");
        const data = await res.json();
        if (res.ok && data.albums) {
          setAlbums(data.albums);
        } else {
          setError("Failed to load albums.");
        }
      } catch {
        setError("Failed to load albums.");
      } finally {
        setLoading(false);
      }
    }
    fetchAlbums();
  }, []);

  const filtered = albums.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.artist || "").toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-4 text-center">
          <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Albums</h1>
          <Link href="/admin/albums/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Album</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search albums..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        {loading ? (
          <div className="text-center py-8">Loading albums...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No albums found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Title</th>
                <th className="py-2 px-4 font-semibold">Artist</th>
                <th className="py-2 px-4 font-semibold">Year</th>
                <th className="py-2 px-4 font-semibold">Official</th>
                <th className="py-2 px-4 font-semibold">Links</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(album => (
                <tr key={album.id} className="border-b">
                  <td className="py-2 px-4">{album.title}</td>
                  <td className="py-2 px-4">{album.artist || <span className="text-gray-400 italic">—</span>}</td>
                  <td className="py-2 px-4">{album.releaseYear || <span className="text-gray-400 italic">—</span>}</td>
                  <td className="py-2 px-4">{album.isOfficial ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/external-links?entityType=album&entityId=${album.id}`}>
                      <button className="bg-green-100 text-green-800 font-semibold py-1 px-3 rounded-md shadow hover:bg-green-200 transition">Links</button>
                    </Link>
                  </td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/albums/${album.id}`}>
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
