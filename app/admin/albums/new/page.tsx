"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAlbumPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    artist: "",
    releaseYear: "",
    isOfficial: true,
    notes: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

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
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          releaseYear: form.releaseYear ? Number(form.releaseYear) : null,
        }),
      });
      if (res.ok) {
        router.push("/admin/albums");
      } else {
        setErrors({ form: "Failed to create album." });
      }
    } catch {
      setErrors({ form: "Failed to create album." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Album</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title<span className="text-red-500">*</span></label>
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
          {/* Artist */}
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
          {/* Release Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
            <input
              type="number"
              name="releaseYear"
              value={form.releaseYear}
              onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.releaseYear ? "border-red-500" : "border-gray-300"}`}
              placeholder="e.g. 1970"
            />
            {errors.releaseYear && <p className="text-red-500 text-xs mt-1">{errors.releaseYear}</p>}
          </div>
          {/* Is Official */}
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
          {/* Notes */}
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
          {errors.form && <p className="text-red-500 text-sm mb-2">{errors.form}</p>}
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition w-full"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Album"}
          </button>
        </form>
      </div>
    </div>
  );
}
