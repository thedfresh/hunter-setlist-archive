"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BandForm from "./BandForm";

export default function BandListPage() {
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBand, setEditingBand] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBands();
  }, []);

  async function fetchBands() {
    setLoading(true);
    try {
      const res = await fetch("/api/bands");
      const data = await res.json();
      if (res.ok && data.bands) {
  setBands(data.bands);
      } else {
        setError(data.error || "Failed to fetch bands.");
      }
    } catch {
      setError("Failed to fetch bands.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditingBand(null);
    setShowForm(true);
  }

  function handleEdit(band: any) {
    setEditingBand(band);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this band?")) return;
    try {
  const res = await fetch(`/api/admin/bands/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Band deleted.");
        fetchBands();
      } else {
        setError("Failed to delete band.");
      }
    } catch {
      setError("Failed to delete band.");
    }
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingBand(null);
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditingBand(null);
    fetchBands();
    setSuccess("Band saved.");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Bands</h1>
          <button
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition"
            onClick={handleAdd}
          >
            Add New Band
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        {loading ? (
          <div className="text-center py-8">Loading bands...</div>
        ) : (
          <>
            <h2 className="text-xl font-bold mt-4 mb-2">Hunter Bands</h2>
            <table className="w-full border rounded-md overflow-hidden mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Display Name</th>
                  <th className="text-left px-4 py-2">Member Count</th>
                  <th className="text-left px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bands.filter(b => b.isHunterBand).map(band => (
                  <tr key={band.id} className="border-t">
                    <td className="px-4 py-2 font-semibold text-gray-800">{band.name}</td>
                    <td className="px-4 py-2">{band.displayName || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-2">{band.bandMusicians?.length || 0}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Link
                        href={`/admin/bands/${band.id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        onClick={() => handleDelete(band.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2 className="text-xl font-bold mt-4 mb-2">Hunter as Guest</h2>
            <table className="w-full border rounded-md overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Display Name</th>
                  <th className="text-left px-4 py-2">Member Count</th>
                  <th className="text-left px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bands.filter(b => !b.isHunterBand).map(band => (
                  <tr key={band.id} className="border-t">
                    <td className="px-4 py-2 font-semibold text-gray-800">{band.name}</td>
                    <td className="px-4 py-2">{band.displayName || <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-2">{band.bandMusicians?.length || 0}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Link
                        href={`/admin/bands/${band.id}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                        onClick={() => handleDelete(band.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {showForm && (
          <BandForm
            band={editingBand}
            onClose={handleFormClose}
            onSaved={handleFormSaved}
          />
        )}
      </div>
    </div>
  );
}
