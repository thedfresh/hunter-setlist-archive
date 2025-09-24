"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

type ExternalLink = {
  id: number;
  url: string;
  title?: string;
  description?: string;
  createdAt: string;
};

type LinkAssociation = {
  id: number;
  entityType: string;
  entityId: number;
  linkType: string;
  isPublic: boolean;
  link: ExternalLink;
  entityName?: string;
};

export default function ExternalLinksPage() {
  const [links, setLinks] = useState<LinkAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch("/api/external-links");
        const data = await res.json();
        if (res.ok && data.links) {
          setLinks(data.links);
        } else {
          setError("Failed to load external links.");
        }
      } catch {
        setError("Failed to load external links.");
      } finally {
        setLoading(false);
      }
    }
    fetchLinks();
  }, []);

  const filtered = links.filter(l =>
    (l.link.title || "").toLowerCase().includes(search.toLowerCase()) ||
    l.link.url.toLowerCase().includes(search.toLowerCase()) ||
    (l.entityName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-4 text-center">
        <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">External Links</h1>
          <Link href="/admin/external-links/new">
            <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Link</button>
          </Link>
        </div>
        <input
          type="text"
          placeholder="Search links..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        {loading ? (
          <div className="text-center py-8">Loading links...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No links found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 font-semibold">Title</th>
                <th className="py-2 px-4 font-semibold">URL</th>
                <th className="py-2 px-4 font-semibold">Entity</th>
                <th className="py-2 px-4 font-semibold">Link Type</th>
                <th className="py-2 px-4 font-semibold">Public?</th>
                <th className="py-2 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b">
                  <td className="py-2 px-4">{l.link.title || <span className="text-gray-400 italic">—</span>}</td>
                  <td className="py-2 px-4">
                    <a href={l.link.url} target="_blank" className="text-blue-600 underline">{l.link.url}</a>
                  </td>
                  <td className="py-2 px-4">{l.entityType}: {l.entityName || l.entityId}</td>
                  <td className="py-2 px-4">{l.linkType}</td>
                  <td className="py-2 px-4">{l.isPublic ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">
                    <Link href={`/admin/external-links/${l.id}`}>
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