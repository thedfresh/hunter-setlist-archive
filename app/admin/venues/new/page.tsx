"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVenuePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    city: "",
    stateProvince: "",
    country: "",
    isUncertain: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.name) newErrors.name = "Venue name is required.";
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
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/admin/venues/success");
      } else {
        setErrors({ form: "Failed to create venue." });
      }
    } catch {
      setErrors({ form: "Failed to create venue." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Venue</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name<span className="text-red-500">*</span></label>
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
          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          {/* State/Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
            <input
              type="text"
              name="stateProvince"
              value={form.stateProvince}
              onChange={e => setForm(f => ({ ...f, stateProvince: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            />
          </div>
          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
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
          {/* Error Message */}
          {errors.form && <p className="text-red-500 text-sm mb-2">{errors.form}</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Create Venue"}
          </button>
        </form>
      </div>
    </div>
  );
}
