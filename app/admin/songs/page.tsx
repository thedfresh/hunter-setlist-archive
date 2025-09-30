"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Song = {
  id: number;
  title: string;
  originalArtist?: string;
  isUncertain: boolean;
  inBoxOfRain: boolean;
  leadVocals?: { id: number; name: string } | null;
  albums?: { id: number; title: string }[];
  tags?: { id: number; name: string }[];
  createdAt: string;
  performanceCount: number;
};

export default function SongsAdminPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideNoPerformances, setHideNoPerformances] = useState(false);

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();
        if (res.ok && data.songs) {
          console.log('Songs API response:', data.songs);
          setSongs(data.songs);
        } else {
          setError("Failed to load songs");
        }
      } catch {
        setError("Failed to load songs");
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  const filtered = songs.filter(song =>
    // Match search term
    (song.title.toLowerCase().includes(search.toLowerCase()) ||
      (song.originalArtist || "").toLowerCase().includes(search.toLowerCase())) &&
    // Optionally hide songs with zero performances
    (!hideNoPerformances || song.performanceCount > 0)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Songs</h1>
          <Link href="/admin/songs/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Song</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="hideNoPerformances"
            checked={hideNoPerformances}
            onChange={e => setHideNoPerformances(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="hideNoPerformances" className="text-sm text-gray-700">Hide songs with no performances</label>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading songs...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No songs found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Title</th>
                <th className="py-2 px-4 font-semibold">Albums</th>
                <th className="py-2 px-4 font-semibold">Tags</th>
                <th className="py-2 px-4 font-semibold">Uncertain?</th>
                <th className="py-2 px-4 font-semibold">Box of Rain?</th>
                <th className="py-2 px-4 font-semibold">Performances</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(song => (
                <tr key={song.id} className="border-b">
                  <td className="py-2 px-4">{song.title}</td>
                  <td className="py-2 px-4">
                    {song.albums && song.albums.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {song.albums.map(album => (
                          <span key={album.id} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{album.title}</span>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="py-2 px-4">
                    {song.tags && song.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {song.tags.map(tag => (
                          <span key={tag.id} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">{tag.name}</span>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="py-2 px-4">{song.isUncertain ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">{song.inBoxOfRain ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">{song.performanceCount > 0 ? song.performanceCount : ""}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/songs/${song.id}`}> 
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