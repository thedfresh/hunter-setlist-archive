"use client";
import React, { useEffect, useState } from "react";
import { compareSongTitles } from '@/lib/songSort';
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
  const [showOnlyUncertain, setShowOnlyUncertain] = useState(false);
  const [showOnlyNoPerformances, setShowOnlyNoPerformances] = useState(false);
  const [showOnlyWithPerformances, setShowOnlyWithPerformances] = useState(false);
  // Sorting state: field and order
  const [sortField, setSortField] = useState<'title' | 'performanceCount'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // Change sort field or toggle order
  function changeSort(field: 'title' | 'performanceCount') {
    if (field === sortField) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'title' ? 'asc' : 'desc');
    }
  }

  useEffect(() => {
    async function fetchSongs() {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();
        if (res.ok && data.songs) {
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

  const filtered = songs.filter(song => {
    // Match search term
    const matchesSearch =
      song.title.toLowerCase().includes(search.toLowerCase()) ||
      (song.originalArtist || "").toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    // Show only uncertain songs if toggled
    if (showOnlyUncertain && !song.isUncertain) return false;
    // Show only songs with no performances if toggled
    if (showOnlyNoPerformances && song.performanceCount > 0) return false;
    // Show only songs with performances if toggled
    if (showOnlyWithPerformances && song.performanceCount === 0) return false;
    return true;
  });

  // Apply sorting to filtered list
  const displayed = [...filtered].sort((a, b) => {
    if (sortField === 'title') {
      return sortOrder === 'asc'
        ? compareSongTitles(a, b)
        : compareSongTitles(b, a);
    } else {
      return sortOrder === 'asc'
        ? a.performanceCount - b.performanceCount
        : b.performanceCount - a.performanceCount;
    }
  });
  // Handler to delete a song
  async function handleDeleteSong(id: number) {
    if (!confirm('Delete this song?')) return;
    const res = await fetch(`/api/admin/songs/${id}`, { method: 'DELETE' });
    if (res.ok) setSongs(s => s.filter(song => song.id !== id));
    else alert('Failed to delete song.');
  }
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
        <div className="mb-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyUncertain}
              onChange={e => setShowOnlyUncertain(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show only uncertain songs</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyNoPerformances}
              onChange={e => setShowOnlyNoPerformances(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show only songs with no performances</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyWithPerformances}
              onChange={e => setShowOnlyWithPerformances(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show only songs with performances</span>
          </label>
        </div>
        <div className="mb-4 text-sm text-gray-600">
          Showing {displayed.length} {displayed.length === 1 ? 'song' : 'songs'}
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
                <th
                  className="py-2 px-4 font-semibold cursor-pointer"
                  onClick={() => changeSort('title')}
                >
                  Title
                  {sortField === 'title' && (sortOrder === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th className="py-2 px-4 font-semibold">Uncertain?</th>
                <th className="py-2 px-4 font-semibold">Box of Rain?</th>
                <th
                  className="py-2 px-4 font-semibold cursor-pointer"
                  onClick={() => changeSort('performanceCount')}
                >
                  Performances {sortField === 'performanceCount' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                </th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(song => (
                <tr key={song.id} className="border-b">
                  <td className="py-2 px-4">{song.title}</td>
                  <td className="py-2 px-4">{song.isUncertain ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">{song.inBoxOfRain ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">{song.performanceCount > 0 ? song.performanceCount : ""}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/songs/${song.id}`}>
                      <button className="bg-gray-200 text-gray-800 text-sm py-1 px-2 rounded hover:bg-gray-300 transition mr-1">Edit</button>
                    </Link>
                    <button
                      className="bg-red-200 text-red-800 text-sm py-1 px-2 rounded hover:bg-red-300 transition"
                      onClick={() => handleDeleteSong(song.id)}
                    >Delete</button>
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