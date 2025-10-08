"use client";
import React, { useState, useEffect } from "react";

interface BandMembersSectionProps {
  bandId: number;
  bandMusicians: any[];
}


export default function BandMembersSection({ bandId, bandMusicians }: BandMembersSectionProps) {
  const [members, setMembers] = useState<any[]>(bandMusicians);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [musicians, setMusicians] = useState<any[]>([]);
  const [addForm, setAddForm] = useState({
    musicianId: "",
    joinedDate: "",
    leftDate: "",
    publicNotes: "",
    privateNotes: "",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [editMember, setEditMember] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    joinedDate: "",
    leftDate: "",
    publicNotes: "",
    privateNotes: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchMusicians();
  }, []);

  async function fetchMusicians() {
    try {
      const res = await fetch("/api/musicians");
      const data = await res.json();
      if (res.ok && data.musicians) {
        setMusicians(data.musicians);
      }
    } catch {}
  }

  async function refreshMembers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bands/${bandId}/members`);
      const data = await res.json();
      if (res.ok && data.members) {
        setMembers(data.members);
      } else {
        setError(data.error || "Failed to fetch members.");
      }
    } catch {
      setError("Failed to fetch members.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(memberId: number) {
    if (!confirm("Remove this member from the band?")) return;
    setLoading(true);
    try {
  const res = await fetch(`/api/admin/bands/${bandId}/members/${memberId}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Member removed.");
        refreshMembers();
      } else {
        setError("Failed to remove member.");
      }
    } catch {
      setError("Failed to remove member.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    setError(null);
    try {
      const payload = {
        musicianId: Number(addForm.musicianId),
        joinedDate: addForm.joinedDate,
        leftDate: addForm.leftDate,
        publicNotes: addForm.publicNotes,
        privateNotes: addForm.privateNotes,
      };
      const res = await fetch(`/api/admin/bands/${bandId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess("Member added.");
        setAddForm({ musicianId: "", joinedDate: "", leftDate: "", publicNotes: "", privateNotes: "" });
        refreshMembers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add member.");
      }
    } catch {
      setError("Failed to add member.");
    } finally {
      setAddLoading(false);
    }
  }

  function openEdit(member: any) {
    setEditMember(member);
    setEditForm({
      joinedDate: member.joinedDate ? member.joinedDate.slice(0, 10) : "",
      leftDate: member.leftDate ? member.leftDate.slice(0, 10) : "",
      publicNotes: member.publicNotes || "",
      privateNotes: member.privateNotes || "",
    });
  }

  async function handleEditMember(e: React.FormEvent) {
    e.preventDefault();
    if (!editMember) return;
    setEditLoading(true);
    setError(null);
    try {
      const payload = {
        joinedDate: editForm.joinedDate,
        leftDate: editForm.leftDate,
        publicNotes: editForm.publicNotes,
        privateNotes: editForm.privateNotes,
      };
      const res = await fetch(`/api/admin/bands/${bandId}/members/${editMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess("Member updated.");
        setEditMember(null);
        refreshMembers();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update member.");
      }
    } catch {
      setError("Failed to update member.");
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-4">Band Members</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading ? (
        <div className="text-center py-4">Loading members...</div>
      ) : (
        <table className="w-full border rounded-md overflow-hidden mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-4 py-2">Musician</th>
              <th className="text-left px-4 py-2">Joined</th>
              <th className="text-left px-4 py-2">Left</th>
              <th className="text-left px-4 py-2">Public Notes</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">No members yet.</td>
              </tr>
            ) : members.map(member => (
              <tr key={member.id} className="border-t">
                <td className="px-4 py-2 font-semibold text-gray-800">{member.musician?.name || "Unknown"}</td>
                <td className="px-4 py-2">{member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : ""}</td>
                <td className="px-4 py-2">{member.leftDate ? new Date(member.leftDate).toLocaleDateString() : ""}</td>
                <td className="px-4 py-2">{member.publicNotes || ""}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    onClick={() => openEdit(member)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    onClick={() => handleRemove(member.id)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Member Form */}
      <form className="bg-gray-50 border rounded-lg p-6 mb-6" onSubmit={handleAddMember}>
        <h3 className="font-semibold mb-2">Add Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 font-medium">Musician</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={addForm.musicianId}
              onChange={e => setAddForm(f => ({ ...f, musicianId: e.target.value }))}
              required
            >
              <option value="">Select musician</option>
              {musicians.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Joined Date</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="YYYY-MM-DD"
              value={addForm.joinedDate}
              onChange={e => setAddForm(f => ({ ...f, joinedDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Left Date</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="YYYY-MM-DD"
              value={addForm.leftDate}
              onChange={e => setAddForm(f => ({ ...f, leftDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Public Notes</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={addForm.publicNotes}
              onChange={e => setAddForm(f => ({ ...f, publicNotes: e.target.value }))}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Private Notes</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={addForm.privateNotes}
              onChange={e => setAddForm(f => ({ ...f, privateNotes: e.target.value }))}
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow hover:bg-blue-700 transition"
          disabled={addLoading}
        >
          {addLoading ? "Adding..." : "Add Member"}
        </button>
      </form>

      {/* Edit Member Modal */}
      {editMember && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setEditMember(null)}
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Member</h3>
            <form onSubmit={handleEditMember} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Joined Date</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="YYYY-MM-DD"
                  value={editForm.joinedDate}
                  onChange={e => setEditForm(f => ({ ...f, joinedDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Left Date</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="YYYY-MM-DD"
                  value={editForm.leftDate}
                  onChange={e => setEditForm(f => ({ ...f, leftDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Public Notes</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={editForm.publicNotes}
                  onChange={e => setEditForm(f => ({ ...f, publicNotes: e.target.value }))}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Private Notes</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  value={editForm.privateNotes}
                  onChange={e => setEditForm(f => ({ ...f, privateNotes: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setEditMember(null)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
