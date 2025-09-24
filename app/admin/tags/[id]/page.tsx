"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Tag = {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
};

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [tag, setTag] = useState<Tag | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchTag() {
      try {
        const res = await fetch(`/api/tags/${id}`);
        const data = await res.json();
        if (res.ok && data.tag) {
          setTag(data.tag);
          setForm({
            name: data.tag.name || "",
            description: data.tag.description || "",
          });
        } else {
          setError("Tag not found.");
        }
      } catch {
        setError("Failed to load tag.");
      } finally {
        setLoading(false);
      }
    }
    fetchTag();
  }, [id]);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.name.trim()) newErrors.name = "Tag name is required.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setError(newErrors.name);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else if (data.error && data.error.includes("unique")) {
        setError("Tag name must be unique.");
      } else {
        setError("Failed to update tag.");
      }
    } catch {
      setError("Failed to update tag.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/tags");
      } else {
        setDeleteError("Failed to delete tag.");
      }
    } catch {
      setDeleteError("Failed to delete tag.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading tag...</div>;
  }
  if (!tag) {
    return <div className="p-8 text-center text-red-500">Tag not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Tag</h1>
        <div className="mb-4 text-center">
          <Link href="/admin/tags" className="text-blue-600 hover:underline font-semibold">Back to Tags</Link>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={3}
              placeholder="Optional description..."
            />
          </div>
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-2">Tag updated successfully!</p>}
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
          Delete Tag
        </button>
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
        <p className="mt-6 text-gray-500 text-xs">Created: {new Date(tag.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
