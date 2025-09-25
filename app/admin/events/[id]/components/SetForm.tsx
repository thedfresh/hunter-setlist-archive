import React, { useState } from "react";
import { Set } from '@/lib/types';

interface SetFormProps {
  eventId: any;
  setTypes: any[];
  sets: Set[];
  editingSet: Set | null;
  onClose: () => void;
  onSaved: () => void;
}

const SetForm: React.FC<SetFormProps> = ({ eventId, setTypes, sets, editingSet, onClose, onSaved }) => {
  const [form, setForm] = useState({
    setTypeId: editingSet?.setTypeId || "",
    position: editingSet?.position || (sets.length + 1),
    notes: editingSet?.notes || "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.setTypeId) newErrors.setTypeId = "Set type required.";
    if (!form.position || isNaN(Number(form.position))) newErrors.position = "Position required.";
    if (
      sets.some(
        (s: Set) =>
          Number(s.position) === Number(form.position) &&
          (!editingSet || s.id !== editingSet.id)
      )
    ) {
      newErrors.position = "Duplicate position in this event.";
    }
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
    const payload = {
      setTypeId: Number(form.setTypeId),
      position: Number(form.position),
      notes: form.notes,
    };
    let res;
    if (editingSet) {
      res = await fetch(`/api/events/${eventId}/sets/${editingSet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/events/${eventId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    if (res.ok) {
      onSaved();
    } else {
      setErrors({ form: "Failed to save set." });
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">{editingSet ? "Edit Set" : "Add New Set"}</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Set Type<span className="text-red-500">*</span></label>
            <select
              name="setTypeId"
              value={form.setTypeId}
              onChange={e => setForm(f => ({ ...f, setTypeId: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.setTypeId ? "border-red-500" : "border-gray-300"}`}
              required
            >
              <option value="">Select type</option>
              {setTypes.map((t: any) => (
                <option key={t.id} value={t.id}>{t.displayName}</option>
              ))}
            </select>
            {errors.setTypeId && <p className="text-red-500 text-xs mt-1">{errors.setTypeId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position<span className="text-red-500">*</span></label>
            <input
              type="number"
              name="position"
              value={form.position}
              min={1}
              onChange={e => setForm(f => ({ ...f, position: Number(e.target.value) }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.position ? "border-red-500" : "border-gray-300"}`}
              required
            />
            {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              rows={2}
            />
          </div>
          {errors.form && <p className="text-red-500 text-xs mt-1">{errors.form}</p>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetForm;
