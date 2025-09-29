"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewMusicianPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    isUncertain: false,
    publicNotes: "",
    privateNotes: "",
    defaultInstrumentIds: [] as number[],
  });
  const [instruments, setInstruments] = useState<{ id: number; name: string }[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingInstruments, setLoadingInstruments] = useState(true);

  useEffect(() => {
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
    fetchInstruments();
  }, []);

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
      const res = await fetch("/api/musicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/admin/musicians/success");
      } else {
        setErrors({ form: "Failed to create musician." });
      }
    } catch {
      setErrors({ form: "Failed to create musician." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Musician</h1>
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
          {/* Error Message */}
          {errors.form && <p className="text-red-500 text-sm mb-2">{errors.form}</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Add Musician"}
          </button>
        </form>
      </div>
    </div>
  );
}
