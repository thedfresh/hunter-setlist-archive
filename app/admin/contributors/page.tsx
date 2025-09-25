"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type Contributor = {
  id: number;
  name: string;
  email?: string;
  notes?: string;
  createdAt: string;
};

export default function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContributors() {
      try {
        const res = await fetch("/api/contributors");
        const data = await res.json();
        if (res.ok && data.contributors) {
          setContributors(data.contributors);
        } else {
          setError("Failed to load contributors");
        }
      } catch {
        setError("Failed to load contributors");
      } finally {
        setLoading(false);
      }
    }
    fetchContributors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
  <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Contributors</h1>
          <Link href="/admin/contributors/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Contributor</button>
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading contributors...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : contributors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No contributors found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Name</th>
                <th className="py-2 px-4 font-semibold">Email</th>
                <th className="py-2 px-4 font-semibold">Notes</th>
                <th className="py-2 px-4 font-semibold">Created</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributors.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="py-2 px-4">{c.name}</td>
                  <td className="py-2 px-4">{c.email || <span className="text-gray-400 italic">—</span>}</td>
                  <td className="py-2 px-4">{c.notes || <span className="text-gray-400 italic">—</span>}</td>
                  <td className="py-2 px-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/contributors/${c.id}`}>
                      <button className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded-md shadow hover:bg-gray-300 transition">Edit</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
