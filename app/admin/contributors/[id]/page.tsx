"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ContributorEditPage() {
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    async function fetchContributor() {
      try {
        const res = await fetch(`/api/contributors/${params.id}`);
        const data = await res.json();
        if (res.ok && data.contributor) {
          setName(data.contributor.name);
          setEmail(data.contributor.email || "");
          setNotes(data.contributor.notes || "");
        } else {
          setError("Contributor not found.");
        }
      } catch {
        setError("Failed to load contributor.");
      } finally {
        setLoading(false);
      }
    }
    fetchContributor();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Contributor name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/contributors/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, notes }),
      });
      if (res.ok) {
        router.push("/admin/contributors");
      } else {
        setError("Failed to update contributor.");
      }
    } catch {
      setError("Failed to update contributor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this contributor?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/contributors/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/contributors");
      } else {
        setError("Failed to delete contributor.");
      }
    } catch {
      setError("Failed to delete contributor.");
    } finally {
      setSubmitting(false);
    }
  }



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Contributor</h1>
        <div className="mb-4 text-center">
          <Link href="/admin/contributors" className="text-blue-600 hover:underline font-semibold">Back to Contributors</Link>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              disabled={submitting}
            />
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={2}
              disabled={submitting}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition w-full"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 transition w-full"
              onClick={handleDelete}
              disabled={submitting}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
