"use client";
import React, { useState } from "react";
import { generateSlugFromName } from '@/lib/generateSlug';

interface BandFormProps {
  band?: any;
  onClose: () => void;
  onSaved: () => void;
}

export default function BandForm({ band, onClose, onSaved }: BandFormProps) {
  const [name, setName] = useState(band?.name || "");
  const [publicNotes, setPublicNotes] = useState(band?.publicNotes || "");
  const [privateNotes, setPrivateNotes] = useState(band?.privateNotes || "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
  const slug = generateSlugFromName(name);
  const payload = { name, slug, publicNotes, privateNotes };
    try {
      const res = await fetch(band ? `/api/admin/bands/${band.id}` : "/api/admin/bands", {
        method: band ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save band.");
      }
    } catch {
      setError("Failed to save band.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{band ? "Edit Band" : "Add Band"}</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Public Notes</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={publicNotes}
              onChange={e => setPublicNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Private Notes</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={privateNotes}
              onChange={e => setPrivateNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
              disabled={saving}
            >
              {saving ? "Saving..." : band ? "Save Changes" : "Add Band"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
