import React from "react";

interface ContributorFormProps {
  name: string;
  email: string;
  publicNotes: string;
  privateNotes: string;
  submitting: boolean;
  error?: string | null;
  onChange: (fields: Partial<{ name: string; email: string; publicNotes: string; privateNotes: string }>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete?: () => void;
  isEdit?: boolean;
}

export default function ContributorForm({
  name,
  email,
  publicNotes,
  privateNotes,
  submitting,
  error,
  onChange,
  onSubmit,
  onDelete,
  isEdit = false,
}: ContributorFormProps) {
  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
        <input
          type="text"
          value={name}
          onChange={e => onChange({ name: e.target.value })}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          disabled={submitting}
        />
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => onChange({ email: e.target.value })}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          disabled={submitting}
        />
      </div>
      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Public Notes</label>
          <textarea
            value={publicNotes}
            onChange={e => onChange({ publicNotes: e.target.value })}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            rows={2}
            disabled={submitting}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Private Notes</label>
          <textarea
            value={privateNotes}
            onChange={e => onChange({ privateNotes: e.target.value })}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            rows={2}
            disabled={submitting}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition w-full"
          disabled={submitting}
        >
          {submitting ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Contributor")}
        </button>
        {isEdit && onDelete && (
          <button
            type="button"
            className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-red-600 transition w-full"
            onClick={onDelete}
            disabled={submitting}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
