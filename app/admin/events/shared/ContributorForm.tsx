import React from "react";

interface ContributorFormProps {
  contributorId: number;
  contributorName: string;
  isNew: boolean;
  description: string;
  publicNotes: string;
  privateNotes: string;
  allContributors: { id: number; name: string }[];
  onChange: (fields: Partial<any>) => void;
}

export default function ContributorForm({
  contributorId,
  contributorName,
  isNew,
  description,
  publicNotes,
  privateNotes,
  allContributors,
  onChange,
}: ContributorFormProps) {
  return (
    <>
      <select
        className="border rounded px-2 py-1 mb-1 w-full"
        value={isNew ? "new" : contributorId}
        onChange={e => {
          if (e.target.value === "new") {
            onChange({ isNew: true, contributorId: 0 });
          } else {
            onChange({ isNew: false, contributorId: Number(e.target.value), contributorName: "" });
          }
        }}
      >
        <option key="select" value={0}>Select contributor...</option>
        {allContributors.map(c => (
          <option key={"contrib-" + c.id} value={c.id}>{c.name}</option>
        ))}
        <option key="new" value="new">Create New Contributor</option>
      </select>
      {isNew && (
        <input
          className="border rounded px-2 py-1 mb-1 w-full"
          placeholder="Contributor Name"
          value={contributorName}
          onChange={e => onChange({ contributorName: e.target.value })}
        />
      )}
      <input
        className="border rounded px-2 py-1 mb-1 w-full"
        placeholder="Description"
        value={description}
        onChange={e => onChange({ description: e.target.value })}
      />
      <div className="flex gap-2">
        <textarea
          className="border rounded px-2 py-1 mb-1 w-full"
          placeholder="Public Notes"
          value={publicNotes}
          onChange={e => onChange({ publicNotes: e.target.value })}
          rows={2}
        />
        <textarea
          className="border rounded px-2 py-1 mb-1 w-full"
          placeholder="Private Notes"
          value={privateNotes}
          onChange={e => onChange({ privateNotes: e.target.value })}
          rows={2}
        />
      </div>
    </>
  );
}
