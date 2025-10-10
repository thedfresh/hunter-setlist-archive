"use client";
import React, { useState, useEffect } from "react";
import { generateSlugFromName } from '@/lib/utils/generateSlug';
import { useRouter } from "next/navigation";
import Link from "next/link";

type Musician = { id: number; name: string };
type Album = { id: number; title: string };
type Tag = { id: number; name: string };

export default function NewSongPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    alternateTitle: "",
    originalArtist: "",
    lyricsBy: "",
    musicBy: "",
    notes: "",
    isUncertain: false,
    inBoxOfRain: false,
    leadVocalsId: "",
    albumIds: [] as number[],
    tagIds: [] as number[],
  });
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [musRes, albRes, tagRes] = await Promise.all([
          fetch("/api/musicians"),
          fetch("/api/albums"),
          fetch("/api/tags"),
        ]);
        const musData = await musRes.json();
        const albData = await albRes.json();
        const tagData = await tagRes.json();
        setMusicians(musData.musicians || []);
        setAlbums(albData.albums || []);
        setTags(tagData.tags || []);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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
      const slug = generateSlugFromName(form.title);
      const res = await fetch("/api/admin/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          leadVocalsId: form.leadVocalsId ? Number(form.leadVocalsId) : null,
          albumIds: form.albumIds,
          tagIds: form.tagIds,
        }),
      });
      if (res.ok) {
        router.push("/admin/songs/success");
      } else {
        const data = await res.json();
        setErrors({ form: data.error || "Failed to create song." });
      }
    } catch {
      setErrors({ form: "Failed to create song." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="mb-4 text-center">
          <Link href="/admin/songs" className="text-blue-600 hover:underline font-semibold">Back to Songs</Link>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add Song</h1>
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
          {/* Albums */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Albums</label>
            {loading ? (
              <div className="text-gray-500 text-sm">Loading albums...</div>
            ) : (
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
            )}
          </div>
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            {loading ? (
              <div className="text-gray-500 text-sm">Loading tags...</div>
            ) : (
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
            )}
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
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Add Song"}
          </button>
        </form>
      </div>
    </div>
  );
}