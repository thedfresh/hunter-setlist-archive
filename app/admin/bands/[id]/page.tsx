"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import BandForm from "../BandForm";
import BandMembersSection from "./components/BandMembersSection";

export default function EditBandPage() {
  const router = useRouter();
  const params = useParams();
  // Direct access for now; update if Next.js migrates to async params
  const bandId = params.id as string;
  const [band, setBand] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBand();
  }, [bandId]);

  async function fetchBand() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bands/${bandId}`);
      const data = await res.json();
      if (res.ok && data.band) {
        setBand(data.band);
      } else {
        setError(data.error || "Failed to fetch band.");
      }
    } catch {
      setError("Failed to fetch band.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
  }

  function handleFormSaved() {
    setShowForm(false);
    fetchBand();
    setSuccess("Band updated.");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Edit Band</h1>
          <button
            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition"
            onClick={handleEdit}
          >
            Edit Band Details
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        {loading ? (
          <div className="text-center py-8">Loading band...</div>
        ) : band ? (
          <div>
            <div className="mb-6">
              <div className="font-bold text-lg mb-1">{band.name}</div>
              <div className="text-gray-600 mb-1">Display Name: {band.displayName || <span className="text-gray-400">—</span>}</div>
              <div className="text-gray-600 mb-1">Hunter Band: {band.isHunterBand ? "Yes" : "No"}</div>
              <div className="text-gray-700 mb-2">{band.publicNotes}</div>
              <div className="text-gray-500 text-sm">Private: {band.privateNotes}</div>
            </div>
            <BandMembersSection bandId={band.id} bandMusicians={band.bandMusicians || []} />
          </div>
        ) : null}
        {showForm && band && (
          <BandForm
            band={band}
            onClose={handleFormClose}
            onSaved={handleFormSaved}
          />
        )}
      </div>
    </div>
  );
}
