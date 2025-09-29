"use client";
import React, { useState } from "react";
import ContributorForm from "../ContributorForm";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewContributorPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [publicNotes, setPublicNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Contributor name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, publicNotes, privateNotes }),
      });
      if (res.ok) {
        router.push("/admin/contributors/success");
      } else {
        setError("Failed to create contributor.");
      }
    } catch {
      setError("Failed to create contributor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Add Contributor</h1>
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
          isEdit={false}
          onChange={fields => {
            if (fields.name !== undefined) setName(fields.name);
            if (fields.email !== undefined) setEmail(fields.email);
            if (fields.publicNotes !== undefined) setPublicNotes(fields.publicNotes);
            if (fields.privateNotes !== undefined) setPrivateNotes(fields.privateNotes);
          }}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
