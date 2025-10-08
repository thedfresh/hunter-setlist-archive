"use client";
import React, { useEffect, useState } from "react";
import ContributorForm from "../ContributorForm";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ContributorEditPage() {
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [publicNotes, setPublicNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
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
          setPublicNotes(data.contributor.publicNotes || "");
          setPrivateNotes(data.contributor.privateNotes || "");
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
      const res = await fetch(`/api/admin/contributors/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, publicNotes, privateNotes }),
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
  const res = await fetch(`/api/admin/contributors/${params.id}`, { method: "DELETE" });
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
        <ContributorForm
          name={name}
          email={email}
          publicNotes={publicNotes}
          privateNotes={privateNotes}
          submitting={submitting}
          error={error}
          isEdit={true}
          onChange={fields => {
            if (fields.name !== undefined) setName(fields.name);
            if (fields.email !== undefined) setEmail(fields.email);
            if (fields.publicNotes !== undefined) setPublicNotes(fields.publicNotes);
            if (fields.privateNotes !== undefined) setPrivateNotes(fields.privateNotes);
          }}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
