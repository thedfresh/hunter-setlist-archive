"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";


type Musician = { id: number; name: string };
type Album = { id: number; title: string };
type Tag = { id: number; name: string };

export default function SongAddEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string | undefined;
  const isEdit = !!id;
  const [songIds, setSongIds] = useState<number[]>([]);
  const [song, setSong] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    alternateTitle: "",
    originalArtist: "",
    lyricsBy: "",
    musicBy: "",
    publicNotes: "",
    privateNotes: "",
    isUncertain: false,
    inBoxOfRain: false,
    albumIds: [] as number[],
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
        const [musRes, albRes, tagRes, allSongsRes] = await Promise.all([
          fetch("/api/musicians"),
          fetch("/api/albums"),
          fetch("/api/tags"),
          fetch("/api/songs"),
        ]);
        const musData = await musRes.json();
        const albData = await albRes.json();
        const tagData = await tagRes.json();
        const allSongsData = await allSongsRes.json();
        setMusicians(musData.musicians || []);
        setAlbums(albData.albums || []);
        setTags(tagData.tags || []);
        if (allSongsData.songs) {
          setSongIds(allSongsData.songs.map((s: any) => s.id));
        }
        if (isEdit && id) {
          const songRes = await fetch(`/api/songs/${id}`);
          const songData = await songRes.json();
          if (songRes.ok && songData.song) {
            setSong(songData.song);
            setForm({
              title: songData.song.title || "",
              alternateTitle: songData.song.alternateTitle || "",
              originalArtist: songData.song.originalArtist || "",
              lyricsBy: songData.song.lyricsBy || "",
              musicBy: songData.song.musicBy || "",
              publicNotes: songData.song.publicNotes || "",
              privateNotes: songData.song.privateNotes || "",
              isUncertain: !!songData.song.isUncertain,
              inBoxOfRain: !!songData.song.inBoxOfRain,
              albumIds: (songData.song.albums || []).map((a: any) => a.id),
              tagIds: (songData.song.tags || []).map((t: any) => t.id),
            });
          }
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, isEdit]);

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
      const apiUrl = isEdit && id ? `/api/admin/songs/${id}` : "/api/admin/songs";
      const method = isEdit && id ? "PUT" : "POST";
      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          albumIds: form.albumIds,
          tagIds: form.tagIds,
          publicNotes: form.publicNotes,
          privateNotes: form.privateNotes,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        if (!isEdit) {
          const data = await res.json();
          router.push(`/admin/songs/${data.song?.id || ""}`);
        }
      } else {
        const data = await res.json();
        setErrors({ form: data.error || `Failed to ${isEdit ? "update" : "create"} song.` });
      }
    } catch {
      setErrors({ form: `Failed to ${isEdit ? "update" : "create"} song.` });
    } finally {
      setSubmitting(false);
    }
  }


  async function handleDelete() {
    if (!isEdit || !id) return;
    if (!confirm("Are you sure you want to delete this song?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/songs/${id}`, { method: "DELETE" });
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


  // Previous/Next navigation
  const currentIndex = songIds.findIndex(sid => String(sid) === id);
  const prevId = currentIndex > 0 ? songIds[currentIndex - 1] : null;
  const nextId = currentIndex < songIds.length - 1 ? songIds[currentIndex + 1] : null;

  if (loading) {
    return <div className="p-8 text-center">Loading song...</div>;
  }
  if (isEdit && !song) {
    return <div className="p-8 text-center text-red-500">Song not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-4 flex justify-between items-center">
          <Link href="/admin/songs" className="text-blue-600 hover:underline font-semibold">Back to Songs</Link>
          {isEdit && (
            <div className="flex gap-2">
              {prevId && (
                <Link href={`/admin/songs/${prevId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">← Previous</Link>
              )}
              {nextId && (
                <Link href={`/admin/songs/${nextId}`} className="btn btn-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300">Next →</Link>
              )}
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{isEdit ? "Edit Song" : "Add Song"}</h1>
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
          {/* Alternate Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Title</label>
            <input
              type="text"
              name="alternateTitle"
              value={form.alternateTitle}
              onChange={e => setForm(f => ({ ...f, alternateTitle: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
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
          {/* Albums (checkboxes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Albums</label>
            <div className="flex flex-wrap gap-2">
              {albums.map(album => (
                <label key={album.id} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                  <input
                    type="checkbox"
                    checked={form.albumIds.includes(album.id)}
                    onChange={e => {
                      setForm(f => {
                        const ids = f.albumIds.includes(album.id)
                          ? f.albumIds.filter(id => id !== album.id)
                          : [...f.albumIds, album.id];
                        return { ...f, albumIds: ids };
                      });
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{album.title}</span>
                </label>
              ))}
            </div>
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
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Public Notes</label>
              <textarea
                name="publicNotes"
                value={form.publicNotes}
                onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                rows={2}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Private Notes</label>
              <textarea
                name="privateNotes"
                value={form.privateNotes}
                onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                rows={2}
              />
            </div>
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
          {success && <p className="text-green-600 text-sm mb-2">Song {isEdit ? "updated" : "created"} successfully!</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Add Song")}
          </button>
        </form>
        {isEdit && (
          <>
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
            {/* Performances Section */}
            <hr className="my-8" />
            <h2 className="text-xl font-bold mb-4">Performances</h2>
            {song.performances && song.performances.length > 0 ? (
              <div className="space-y-2">
                {[...song.performances]
                  .sort((a: any, b: any) => {
                    const e1 = a.set?.event, e2 = b.set?.event;
                    const y1 = e1?.year || 0, m1 = e1?.month || 0, d1 = e1?.day || 0;
                    const y2 = e2?.year || 0, m2 = e2?.month || 0, d2 = e2?.day || 0;
                    if (y1 !== y2) return y1 - y2;
                    if (m1 !== m2) return m1 - m2;
                    return d1 - d2;
                  })
                  .map((performance: any) => {
                    const event = performance.set?.event;
                    const venue = event?.venue;
                    const dateStr = event?.displayDate || (
                      event?.year ? `${event.month}/${event.day}/${event.year}` : "Unknown Date"
                    );
                    return (
                      <div key={performance.id} className="flex justify-between items-center border p-4 rounded">
                        <div>
                          <p className="font-medium">{dateStr}</p>
                          <p className="text-sm text-gray-600">{venue?.name || "Unknown Venue"}</p>
                        </div>
                        <Link href={`/admin/events/${event?.id}`} className="text-blue-600 hover:underline">View Event</Link>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-600">No performances found for this song.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
