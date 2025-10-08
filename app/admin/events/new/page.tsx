// Form state type for Create New Event
type FormState = {
  year: string;
  month: string;
  day: string;
  displayDate: string;
  showTiming: string;
  venueId: string;
  eventTypeId: string;
  contentTypeId: string;
  primaryBandId: string;
  publicNotes: string;
  privateNotes: string;
  isUncertain: boolean;
  isPublic: boolean;
};
"use client";
import React, { useState, useEffect } from 'react';
import EventContributorsInput, { EventContributor } from './components/EventContributorsInput';
import AddVenueModal from './components/AddVenueModal';
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function NewEventPage() {
  const [venues, setVenues] = useState<{ id: string; name: string; city?: string; state?: string }[]>([]);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [eventTypes, setEventTypes] = useState<{ id: string; name: string }[]>([]);
  const [contentTypes, setContentTypes] = useState<{ id: string; name: string }[]>([]);
  const [bands, setBands] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Contributors state for event creation
  const [contributors, setContributors] = useState<EventContributor[]>([]);

  // Form state lifted to parent
  const [form, setForm] = useState<FormState>({
    year: '',
    month: '',
    day: '',
    displayDate: '',
    showTiming: '',
    venueId: '',
    eventTypeId: '',
    contentTypeId: '',
    primaryBandId: '',
    publicNotes: '',
    privateNotes: '',
    isUncertain: false,
    isPublic: true,
  });

  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const [venuesRes, eventTypesRes, contentTypesRes, bandsRes] = await Promise.all([
          fetch('/api/venues'),
          fetch('/api/events?types=eventTypes'),
          fetch('/api/events?types=contentTypes'),
          fetch('/api/events?types=bands'),
        ]);
        const venuesData = await venuesRes.json();
        const eventTypesData = await eventTypesRes.json();
        const contentTypesData = await contentTypesRes.json();
        const bandsData = await bandsRes.json();
        if (venuesRes.ok && venuesData.venues) setVenues(venuesData.venues);
        else throw new Error('Failed to load venues');
        if (eventTypesRes.ok && eventTypesData.eventTypes) setEventTypes(eventTypesData.eventTypes);
        else throw new Error('Failed to load event types');
        if (contentTypesRes.ok && contentTypesData.contentTypes) setContentTypes(contentTypesData.contentTypes);
        else throw new Error('Failed to load content types');
        if (bandsRes.ok && bandsData.bands) setBands(bandsData.bands);
        else throw new Error('Failed to load bands');

        // Set default values for dropdowns after fetch
        setForm(f => ({
          ...f,
          eventTypeId: eventTypesData.eventTypes?.find((t: any) => t.name.toLowerCase() === 'public performance')?.id || (eventTypesData.eventTypes?.[0]?.id ?? ''),
          contentTypeId: contentTypesData.contentTypes?.find((t: any) => t.name.toLowerCase() === 'music')?.id || (contentTypesData.contentTypes?.[0]?.id ?? ''),
          primaryBandId: bandsData.bands?.find((b: any) => b.name.toLowerCase() === 'robert hunter')?.id || (bandsData.bands?.[0]?.id ?? ''),
        }));
      } catch (err: any) {
        setError(err.message || 'Failed to load dropdowns');
      } finally {
        setLoading(false);
      }
    }
    fetchDropdowns();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  return (
    <>
      <EventForm
        venues={venues}
        eventTypes={eventTypes}
        contentTypes={contentTypes}
        bands={bands}
        onAddVenue={() => setIsVenueModalOpen(true)}
        form={form}
        setForm={setForm}
        contributors={contributors}
        setContributors={setContributors}
      />
      <AddVenueModal
        isOpen={isVenueModalOpen}
        onClose={() => setIsVenueModalOpen(false)}
        onVenueCreated={venue => {
          const newVenue = {
            id: String(venue.id),
            name: venue.name,
            city: venue.city || '',
            stateProvince: venue.stateProvince || ''
          };
          setVenues(vs => {
            const updated = [...vs, newVenue].sort((a, b) => a.name.localeCompare(b.name));
            return updated;
          });
          setForm(f => ({ ...f, venueId: newVenue.id }));
          setIsVenueModalOpen(false);
        }}
      />
    </>
  );
}

interface EventFormProps {
  venues: { id: string; name: string; city?: string; stateProvince?: string }[],
  eventTypes: { id: string; name: string }[],
  contentTypes: { id: string; name: string }[],
  bands: { id: string; name: string }[],
  onAddVenue: () => void,
  form: FormState,
  setForm: React.Dispatch<React.SetStateAction<FormState>>,
  contributors: EventContributor[],
  setContributors: React.Dispatch<React.SetStateAction<EventContributor[]>>,
}

function EventForm({ venues, eventTypes, contentTypes, bands, onAddVenue, form, setForm, contributors, setContributors }: EventFormProps) {
  const router = useRouter();
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
    // Submit to API route, only form data
    try {
      const payload = { ...form };
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.event && data.event.id) {
          router.push(`/admin/events/${data.event.id}`);
        } else {
          router.push('/admin/events/success');
        }
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
        <div className="mb-4">
          <Link href="/admin/events" className="text-blue-600 hover:underline font-semibold">Back to Events</Link>
        </div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Event</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Date Row: Year, Month, Day, Display Date, Set Timing */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[80px] max-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year<span className="text-red-500">*</span></label>
              <input
                type="number"
                name="year"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className={`w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.year ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
            <div className="flex-1 min-w-[60px] max-w-[90px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="number"
                name="month"
                value={form.month}
                onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                min={1}
                max={12}
              />
            </div>
            <div className="flex-1 min-w-[60px] max-w-[90px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <input
                type="number"
                name="day"
                value={form.day}
                onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                min={1}
                max={31}
              />
            </div>
            <div className="flex-1 min-w-[120px] max-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Date</label>
              <input
                type="text"
                name="displayDate"
                value={form.displayDate}
                onChange={e => setForm(f => ({ ...f, displayDate: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                placeholder="e.g. July 4, 1985"
              />
            </div>
            <div className="flex-1 min-w-[100px] max-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Set Timing</label>
              <select
                name="showTiming"
                value={form.showTiming}
                onChange={e => setForm(f => ({ ...f, showTiming: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">—</option>
                <option value="Early">Early</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>
          {/* Venue Dropdown + Add Venue Button */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <select
                name="venueId"
                value={form.venueId}
                onChange={e => setForm(f => ({ ...f, venueId: e.target.value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select venue</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                    {v.city ? ` (${v.city}` : ''}
                    {v.stateProvince ? `${v.city ? ', ' : ' ('}${v.stateProvince})` : v.city ? ')' : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="px-3 py-2 rounded-md bg-blue-100 text-blue-700 font-medium border border-blue-300 hover:bg-blue-200 transition"
              onClick={onAddVenue}
            >
              Add Venue
            </button>
          </div>
          {/* Event Type, Content Type, Band Row */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[120px] max-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                name="eventTypeId"
                value={form.eventTypeId}
                onChange={e => setForm(f => ({ ...f, eventTypeId: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select type</option>
                {eventTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px] max-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                name="contentTypeId"
                value={form.contentTypeId}
                onChange={e => setForm(f => ({ ...f, contentTypeId: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select content</option>
                {contentTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[120px] max-w-[180px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Band</label>
              <select
                name="primaryBandId"
                value={form.primaryBandId}
                onChange={e => setForm(f => ({ ...f, primaryBandId: e.target.value }))}
                className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
              >
                <option value="">Select band</option>
                {bands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          {/* isPublic and isUncertain Checkboxes */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublic"
                checked={form.isPublic}
                onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Event is public</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isUncertain"
                checked={form.isUncertain}
                onChange={e => setForm(f => ({ ...f, isUncertain: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700">Event date is uncertain</label>
            </div>
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
