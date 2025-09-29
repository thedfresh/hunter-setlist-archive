"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function MusicianDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [musician, setMusician] = useState<{
    id: number;
    name: string;
    isUncertain: boolean;
    createdAt: string;
    defaultInstruments?: { instrument: { id: number; name: string } }[];
  } | null>(null);
  const [form, setForm] = useState({ name: "", isUncertain: false, defaultInstrumentIds: [] as number[] });
  const [instruments, setInstruments] = useState<{ id: number; name: string }[]>([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [notes, setNotes] = useState({ publicNotes: "", privateNotes: "" });

  useEffect(() => {
    async function fetchMusician() {
      try {
        const res = await fetch(`/api/musicians/${id}`);
        const data = await res.json();
        if (res.ok && data.musician) {
          setMusician(data.musician);
          setForm({
            name: data.musician.name,
            isUncertain: data.musician.isUncertain,
            defaultInstrumentIds: (data.musician.defaultInstruments || []).map((di: any) => di.instrument.id),
          });
          setNotes({
            publicNotes: data.musician.publicNotes || "",
            privateNotes: data.musician.privateNotes || "",
          });
        }
      } finally {
        setLoading(false);
      }
    }
    async function fetchInstruments() {
      try {
        const res = await fetch("/api/instruments");
        const data = await res.json();
        if (res.ok && data.instruments) {
          setInstruments(data.instruments);
        }
      } finally {
        setLoadingInstruments(false);
      }
    }
    fetchMusician();
    fetchInstruments();
  }, [id]);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = "Musician name is required.";
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
      const res = await fetch(`/api/musicians/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          publicNotes: notes.publicNotes,
          privateNotes: notes.privateNotes,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setErrors({});
      } else {
        setErrors({ form: "Failed to update musician." });
      }
    } catch {
      setErrors({ form: "Failed to update musician." });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this musician?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/musicians/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/musicians");
      } else {
        setDeleteError("Failed to delete musician.");
      }
    } catch {
      setDeleteError("Failed to delete musician.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading musician...</div>;
  }
  if (!musician) {
    return <div className="p-8 text-center text-red-500">Musician not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Musician</h1>
        <div className="mb-4 text-center">
          <Link href="/admin/musicians" className="text-blue-600 hover:underline font-semibold">Back to Musicians</Link>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Musician Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
          {/* Default Instruments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Instruments</label>
            {loadingInstruments ? (
              <div className="text-gray-500 text-sm">Loading instruments...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {instruments.map(inst => (
                  <label key={inst.id} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                    <input
                      type="checkbox"
                      checked={form.defaultInstrumentIds.includes(inst.id)}
                      onChange={e => {
                        setForm(f => {
                          const ids = f.defaultInstrumentIds.includes(inst.id)
                            ? f.defaultInstrumentIds.filter(id => id !== inst.id)
                            : [...f.defaultInstrumentIds, inst.id];
                          return { ...f, defaultInstrumentIds: ids };
                        });
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{inst.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Public Notes</label>
              <textarea
                name="publicNotes"
                value={notes.publicNotes}
                onChange={e => setNotes(n => ({ ...n, publicNotes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                rows={2}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Private Notes</label>
              <textarea
                name="privateNotes"
                value={notes.privateNotes}
                onChange={e => setNotes(n => ({ ...n, privateNotes: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                rows={2}
              />
            </div>
          </div>

          {/* Error Message */}
          {errors.form && <p className="text-red-500 text-sm mb-2">{errors.form}</p>}
          {/* Success Message */}
          {success && <p className="text-green-600 text-sm mb-2">Musician updated successfully!</p>}
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
          Delete Musician
        </button>
        {deleteError && <p className="text-red-500 text-sm mt-2">{deleteError}</p>}
        <p className="mt-6 text-gray-500 text-xs">Created: {new Date(musician.createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
