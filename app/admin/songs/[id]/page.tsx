"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Musician = { id: number; name: string };
type Album = { id: number; title: string };
type Tag = { id: number; name: string };

export default function EditSongPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [songIds, setSongIds] = useState<number[]>([]);
  const [song, setSong] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    originalArtist: "",
    lyricsBy: "",
    musicBy: "",
    notes: "",
    isUncertain: false,
    inBoxOfRain: false,
    leadVocalsId: "",
    albumId: "",
    tagIds: [] as number[],
  });
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [songRes, musRes, albRes, tagRes, allSongsRes] = await Promise.all([
          fetch(`/api/songs/${id}`),
          fetch("/api/musicians"),
          fetch("/api/albums"),
          fetch("/api/tags"),
          fetch("/api/songs"),
        ]);
        const songData = await songRes.json();
        const musData = await musRes.json();
        const albData = await albRes.json();
        const tagData = await tagRes.json();
        const allSongsData = await allSongsRes.json();
        if (songRes.ok && songData.song) {
          setSong(songData.song);
          setForm({
            title: songData.song.title || "",
            originalArtist: songData.song.originalArtist || "",
            lyricsBy: songData.song.lyricsBy || "",
            musicBy: songData.song.musicBy || "",
            notes: songData.song.notes || "",
            isUncertain: !!songData.song.isUncertain,
            inBoxOfRain: !!songData.song.inBoxOfRain,
            leadVocalsId: songData.song.leadVocals?.id ? String(songData.song.leadVocals.id) : "",
            albumId: (songData.song.albums && songData.song.albums.length > 0) ? String(songData.song.albums[0].id) : "",
            tagIds: (songData.song.tags || []).map((t: any) => t.id),
          });
        }
        setMusicians(musData.musicians || []);
  setAlbums(albData.albums || []);
        setTags(tagData.tags || []);
        // Get sorted song IDs for navigation
        if (allSongsData.songs) {
          setSongIds(allSongsData.songs.map((s: any) => s.id));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.title) newErrors.title = "Song title is required.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/songs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          leadVocalsId: form.leadVocalsId ? Number(form.leadVocalsId) : null,
          albumIds: form.albumId ? [Number(form.albumId)] : [],
          tagIds: form.tagIds,
        }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setErrors({ form: data.error || "Failed to update song." });
      }
    } catch {
      setErrors({ form: "Failed to update song." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this song?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/songs");
      } else {
        setDeleteError("Failed to delete song.");
      }
    } catch {
      setDeleteError("Failed to delete song.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading song...</div>;
  }
  if (!song) {
    return <div className="p-8 text-center text-red-500">Song not found.</div>;
  }

  // Previous/Next navigation
  const currentIndex = songIds.findIndex(sid => String(sid) === id);
  const prevId = currentIndex > 0 ? songIds[currentIndex - 1] : null;
  const nextId = currentIndex < songIds.length - 1 ? songIds[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/admin/songs" className="text-blue-600 hover:underline font-semibold">Back to Songs</Link>
          <div className="flex gap-2">
            {prevId && (
              <Link href={`/admin/songs/${prevId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">← Previous</Link>
            )}
            {nextId && (
              <Link href={`/admin/songs/${nextId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Next →</Link>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Song</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Song Title<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          {/* Original Artist */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Original Artist</label>
            <input
              type="text"
              name="originalArtist"
              value={form.originalArtist}
              onChange={e => setForm(f => ({ ...f, originalArtist: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          {/* Lead Vocals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Vocals</label>
            <select
              name="leadVocalsId"
              value={form.leadVocalsId}
              onChange={e => setForm(f => ({ ...f, leadVocalsId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">—</option>
              {musicians.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          {/* Album (dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Album</label>
            <select
              name="albumId"
              value={form.albumId}
              onChange={e => setForm(f => ({ ...f, albumId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">—</option>
              {albums.map(album => (
                <option key={album.id} value={album.id}>{album.title}</option>
              ))}
            </select>
          </div>
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                  <input
                    type="checkbox"
                    checked={form.tagIds.includes(tag.id)}
                    onChange={e => {
                      setForm(f => {
                        const ids = f.tagIds.includes(tag.id)
                          ? f.tagIds.filter(id => id !== tag.id)
                          : [...f.tagIds, tag.id];
                        return { ...f, tagIds: ids };
                      });
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Lyrics By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lyrics By</label>
            <input
              type="text"
              name="lyricsBy"
              value={form.lyricsBy}
              onChange={e => setForm(f => ({ ...f, lyricsBy: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          {/* Music By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Music By</label>
            <input
              type="text"
              name="musicBy"
              value={form.musicBy}
              onChange={e => setForm(f => ({ ...f, musicBy: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={2}
            />
          </div>
          {/* Is Uncertain */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isUncertain"
              checked={form.isUncertain}
              onChange={e => setForm(f => ({ ...f, isUncertain: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-700">Is Uncertain?</label>
          </div>
          {/* In Box of Rain */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="inBoxOfRain"
              checked={form.inBoxOfRain}
              onChange={e => setForm(f => ({ ...f, inBoxOfRain: e.target.checked }))}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-700">In Box of Rain?</label>
          </div>
          {/* Error Message */}
          {errors.form && <p className="text-red-500 text-sm mb-2">{errors.form}</p>}
          {/* Success Message */}
          {success && <p className="text-green-600 text-sm mb-2">Song updated successfully!</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <hr className="my-8" />
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-md shadow hover:bg-red-700 transition disabled:opacity-50"
          disabled={submitting}
        >
          Delete Song
        </button>
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
        <p className="mt-6 text-gray-500 text-xs">Created: {new Date(song.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}