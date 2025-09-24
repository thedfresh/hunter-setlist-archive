"use client";
import React, { useState } from "react";
import Link from "next/link";

const ENTITY_TYPES = [
  { value: "song", label: "Song" },
  { value: "album", label: "Album" },
  { value: "venue", label: "Venue" },
  { value: "event", label: "Event" },
  { value: "recording", label: "Recording" },
];
const LINK_TYPES = [
  { value: "lyrics", label: "Lyrics" },
  { value: "chords", label: "Chords" },
  { value: "video", label: "Video" },
  { value: "website", label: "Website" },
];

export default function NewExternalLinkPage() {
  const [form, setForm] = useState({
    url: "",
    title: "",
    description: "",
    entityType: ENTITY_TYPES[0].value,
    entityId: "",
    linkType: LINK_TYPES[0].value,
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setForm(f => ({ ...f, [name]: fieldValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!form.url.trim() || !form.entityType || !form.entityId || !form.linkType) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/external-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.url,
          title: form.title,
          description: form.description,
          entityType: form.entityType,
          entityId: form.entityId,
          linkType: form.linkType,
          isPublic: form.isPublic,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({
          url: "",
          title: "",
          description: "",
          entityType: ENTITY_TYPES[0].value,
          entityId: "",
          linkType: LINK_TYPES[0].value,
          isPublic: true,
        });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create link.");
      }
    } catch {
      setError("Failed to create link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
        <Link href="/admin/external-links" className="text-blue-600 hover:underline font-semibold">Back to Links</Link>
      </div>
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Add External Link</h1>
        {error && <div className="mb-4 text-red-600 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-center">Link created successfully!</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-1">URL<span className="text-red-500">*</span></label>
            <input name="url" type="url" value={form.url} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <input name="title" type="text" value={form.title} onChange={handleChange} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Entity Type<span className="text-red-500">*</span></label>
            <select name="entityType" value={form.entityType} onChange={handleChange} required className="w-full border rounded-md px-3 py-2">
              {ENTITY_TYPES.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Entity ID<span className="text-red-500">*</span></label>
            <input name="entityId" type="number" value={form.entityId} onChange={handleChange} required className="w-full border rounded-md px-3 py-2" />
            <div className="text-xs text-gray-500 mt-1">Enter the ID of the entity to link.</div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Link Type<span className="text-red-500">*</span></label>
            <select name="linkType" value={form.linkType} onChange={handleChange} required className="w-full border rounded-md px-3 py-2">
              {LINK_TYPES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <input name="isPublic" type="checkbox" checked={form.isPublic} onChange={handleChange} className="mr-2" />
            <label className="font-semibold">Public?</label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">
            {loading ? "Creating..." : "Create Link"}
          </button>
        </form>
      </div>
    </div>
  );
}