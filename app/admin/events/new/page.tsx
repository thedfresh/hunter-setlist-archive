"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Types for dropdowns
const EVENT_TYPES = [
  { value: 'public', label: 'Public Show' },
  { value: 'studio', label: 'Studio' },
  { value: 'spurious', label: 'Spurious' },
];
const CONTENT_TYPES = [
  { value: 'musical', label: 'Musical' },
  { value: 'interview', label: 'Interview' },
  { value: 'poetry', label: 'Poetry Reading' },
];
const BANDS = [
  { value: 'solo', label: 'Solo' },
  { value: 'dinosaurs', label: 'Dinosaurs' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'roadhog', label: 'Roadhog' },
  // Add more bands as needed
];

export default function NewEventPage() {
  const [venues, setVenues] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch('/api/venues');
        const data = await res.json();
        if (res.ok && data.venues) {
          setVenues(data.venues);
        } else {
          setError('Failed to load venues');
        }
      } catch {
        setError('Failed to load venues');
      } finally {
        setLoading(false);
      }
    }
    fetchVenues();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading venues...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  return <EventForm venues={venues} />;
}

function EventForm({ venues }: { venues: { id: string; name: string }[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    year: '',
    month: '',
    day: '',
    displayDate: '',
    venueId: '',
    eventType: '',
    contentType: '',
    band: '',
    notes: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Validation
  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.year) newErrors.year = 'Year is required.';
    if (form.year && (isNaN(Number(form.year)) || Number(form.year) < 1900)) newErrors.year = 'Enter a valid year.';
    // Add more validation as needed
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
    // Submit to API route (to be implemented)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
  router.push('/admin/events/success');
      } else {
        setErrors({ form: 'Failed to create event.' });
      }
    } catch {
      setErrors({ form: 'Failed to create event.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year<span className="text-red-500">*</span></label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
          </div>
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <input
              type="number"
              name="month"
              value={form.month}
              onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              min={1}
              max={12}
            />
          </div>
          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <input
              type="number"
              name="day"
              value={form.day}
              onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              min={1}
              max={31}
            />
          </div>
          {/* Display Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Date</label>
            <input
              type="text"
              name="displayDate"
              value={form.displayDate}
              onChange={e => setForm(f => ({ ...f, displayDate: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              placeholder="e.g. July 4, 1985"
            />
          </div>
          {/* Venue Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <select
              name="venueId"
              value={form.venueId}
              onChange={e => setForm(f => ({ ...f, venueId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select venue</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          {/* Event Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select
              name="eventType"
              value={form.eventType}
              onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select type</option>
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {/* Content Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select
              name="contentType"
              value={form.contentType}
              onChange={e => setForm(f => ({ ...f, contentType: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select content</option>
              {CONTENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          {/* Band Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Band</label>
            <select
              name="band"
              value={form.band}
              onChange={e => setForm(f => ({ ...f, band: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            >
              <option value="">Select band</option>
              {BANDS.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 resize-vertical"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>
          {/* Error Message */}
          {errors.form && <p className="text-red-500 text-sm mb-2">{errors.form}</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
