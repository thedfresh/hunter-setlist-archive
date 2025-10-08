"use client";
import React, { useEffect, useState } from "react";
// (already imported above)

// Component to display associated songs for an album
function AssociatedSongs({ albumId }: { albumId: number }) {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSongs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/songs');
        const data = await res.json();
        if (res.ok && Array.isArray(data.songs)) {
          // Filter songs that have this album in their songAlbums
          const filtered = data.songs.filter((song: any) =>
            song.songAlbums.some((sa: any) => sa.albumId === albumId)
          );
          setSongs(filtered);
        } else {
          setError('Failed to load songs.');
        }
      } catch {
        setError('Failed to load songs.');
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, [albumId]);

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Associated Songs</h2>
      {loading ? (
        <div className="text-center py-4">Loading songs...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : songs.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No songs associated with this album.</div>
      ) : (
        <ul className="list-disc pl-6">
          {songs.map((song: any) => (
            <li key={song.id} className="mb-2">
              <Link href={`/admin/songs/${song.id}`} className="text-blue-600 underline">
                {song.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

// Inline AlbumLinks component for managing links for this album
function AlbumLinks({ albumId }: { albumId: number }) {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    url: "",
    title: "",
    description: "",
    linkType: "website",
    isPublic: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchLinks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/external-links`);
        const data = await res.json();
        if (res.ok && data.links) {
          setLinks(data.links.filter((l: any) => l.entityType === "album" && l.entityId === albumId));
        } else {
          setError("Failed to load links.");
        }
      } catch {
        setError("Failed to load links.");
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, [albumId]);

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.url.trim() || !form.linkType) {
      setFormError("URL and Link Type are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/external-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url,
          title: form.title,
          description: form.description,
          entityType: "album",
          entityId: albumId,
          linkType: form.linkType,
          isPublic: form.isPublic,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ url: "", title: "", description: "", linkType: "website", isPublic: true });
        // Refresh links
        const data = await res.json();
        setLinks(l => [...l, data.association]);
      } else {
        const data = await res.json();
        setFormError(data.error || "Failed to add link.");
      }
    } catch {
      setFormError("Failed to add link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {loading ? (
        <div className="text-center py-4">Loading links...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : (
        <>
          <table className="w-full text-left border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Title</th>
                <th className="py-2 px-4 font-semibold">URL</th>
                <th className="py-2 px-4 font-semibold">Type</th>
                <th className="py-2 px-4 font-semibold">Public?</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-gray-500">No links for this album.</td></tr>
              ) : (
                links.map(l => (
                  <tr key={l.id} className="border-b">
                    <td className="py-2 px-4">{l.link.title || <span className="text-gray-400 italic">—</span>}</td>
                    <td className="py-2 px-4"><a href={l.link.url} target="_blank" className="text-blue-600 underline">{l.link.url}</a></td>
                    <td className="py-2 px-4">{l.linkType}</td>
                    <td className="py-2 px-4">{l.isPublic ? "Yes" : "No"}</td>
                    <td className="py-2 px-4">
                      <Link href={`/admin/external-links/${l.id}`}>
                        <button className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-md shadow hover:bg-gray-300 transition">Edit</button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {showForm ? (
            <form className="space-y-4 mb-4" onSubmit={handleAddLink}>
              <div>
                <label className="block font-semibold mb-1">URL<span className="text-red-500">*</span></label>
                <input name="url" type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Title</label>
                <input name="title" type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Link Type<span className="text-red-500">*</span></label>
                <select name="linkType" value={form.linkType} onChange={e => setForm(f => ({ ...f, linkType: e.target.value }))} required className="w-full border rounded-md px-3 py-2">
                  <option value="website">Website</option>
                  <option value="lyrics">Lyrics</option>
                  <option value="chords">Chords</option>
                  <option value="video">Video</option>
                </select>
              </div>
              <div className="flex items-center">
                <input name="isPublic" type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} className="mr-2" />
                <label className="font-semibold">Public?</label>
              </div>
              {formError && <div className="text-red-500 text-center mb-2">{formError}</div>}
              <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">{submitting ? "Adding..." : "Add Link"}</button>
              <button type="button" onClick={() => setShowForm(false)} className="w-full mt-2 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md shadow hover:bg-gray-300 transition">Cancel</button>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-green-700 transition">Add New Link</button>
          )}
        </>
      )}
    </div>
  );
}

type Album = {
  id: number;
  title: string;
  artist?: string;
  releaseYear?: number;
  isOfficial: boolean;
  notes?: string;
  createdAt: string;
};

export default function EditAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [albumIds, setAlbumIds] = useState<number[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [form, setForm] = useState({
    title: "",
    artist: "",
    releaseYear: "",
    isOfficial: true,
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchAlbum() {
      try {
        const [res, allRes] = await Promise.all([
          fetch(`/api/albums/${id}`),
          fetch(`/api/albums`),
        ]);
        const data = await res.json();
        const allData = await allRes.json();
        if (res.ok && data.album) {
          setAlbum(data.album);
          setForm({
            title: data.album.title || "",
            artist: data.album.artist || "",
            releaseYear: data.album.releaseYear ? String(data.album.releaseYear) : "",
            isOfficial: !!data.album.isOfficial,
            notes: data.album.notes || "",
          });
        } else {
          setError("Album not found.");
        }
        if (allData.albums) {
          setAlbumIds(
            allData.albums
              .slice()
              .sort((a: any, b: any) => a.title.localeCompare(b.title))
              .map((a: any) => a.id)
          );
        }
      } catch {
        setError("Failed to load album.");
      } finally {
        setLoading(false);
      }
    }
    fetchAlbum();
  }, [id]);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.title.trim()) newErrors.title = "Album title is required.";
    if (form.releaseYear && isNaN(Number(form.releaseYear))) newErrors.releaseYear = "Release year must be a number.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setError(Object.values(newErrors).join(" "));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/albums/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Failed to update album.");
      }
    } catch {
      setError("Failed to update album.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this album?")) return;
    setSubmitting(true);
    try {
  const res = await fetch(`/api/admin/albums/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/albums");
      } else {
        setDeleteError("Failed to delete album.");
      }
    } catch {
      setDeleteError("Failed to delete album.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading album...</div>;
  }
  if (!album) {
    return <div className="p-8 text-center text-red-500">Album not found.</div>;
  }

  // Previous/Next navigation
  const currentIndex = albumIds.findIndex(aid => String(aid) === id);
  const prevId = currentIndex > 0 ? albumIds[currentIndex - 1] : null;
  const nextId = currentIndex < albumIds.length - 1 ? albumIds[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Album</h1>
        <div className="mb-4 flex justify-between items-center">
          <Link href="/admin/albums" className="text-blue-600 hover:underline font-semibold">Back to Albums</Link>
          <div className="flex gap-2">
            {prevId && (
              <Link href={`/admin/albums/${prevId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">← Previous</Link>
            )}
            {nextId && (
              <Link href={`/admin/albums/${nextId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Next →</Link>
            )}
          </div>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Artist</label>
            <input
              type="text"
              name="artist"
              value={form.artist}
              onChange={e => setForm(f => ({ ...f, artist: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="e.g. Robert Hunter, Grateful Dead"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
            <input
              type="number"
              name="releaseYear"
              value={form.releaseYear}
              onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
              placeholder="e.g. 1970"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Is Official Release?</label>
            <select
              name="isOfficial"
              value={form.isOfficial ? "true" : "false"}
              onChange={e => setForm(f => ({ ...f, isOfficial: e.target.value === "true" }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="true">Official</option>
              <option value="false">Bootleg/Compilation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={3}
              placeholder="Optional notes..."
            />
          </div>
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">Album updated successfully!</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <hr className="my-8" />
        {/* External Links Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">External Links</h2>
          <AlbumLinks albumId={album.id} />
        </div>
        {/* Associated Songs Section */}
        <AssociatedSongs albumId={album.id} />
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-md shadow hover:bg-red-700 transition disabled:opacity-50"
          disabled={submitting}
        >
          Delete Album
        </button>
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
        <p className="mt-6 text-gray-500 text-xs">Created: {new Date(album.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
