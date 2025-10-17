'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { generateSlug } from '@/lib/utils/eventSlug';
import { formatVenue } from '@/lib/formatters/venueFormatter';

interface EventMetadataFormProps {
    eventId: number;
    onSaveSuccess: () => void;
}

export default function EventMetadataForm({ eventId, onSaveSuccess }: EventMetadataFormProps) {
    const { showToast } = useToast();

    // Event fields state
    const [year, setYear] = useState<number | string>("");
    const [month, setMonth] = useState<number | string>("");
    const [day, setDay] = useState<number | string>("");
    const [displayDate, setDisplayDate] = useState("");
    const [showTiming, setShowTiming] = useState("");
    const [venueId, setVenueId] = useState<number | string>("");
    const [eventTypeId, setEventTypeId] = useState<number | string>("");
    const [contentTypeId, setContentTypeId] = useState<number | string>("");
    const [primaryBandId, setPrimaryBandId] = useState<number | string>("");
    const [billing, setBilling] = useState("");
    const [etreeShowId, setEtreeShowId] = useState("");
    const [slug, setSlug] = useState("");
    const [sortDate, setSortDate] = useState("");
    const [dateUncertain, setDateUncertain] = useState(false);
    const [venueUncertain, setVenueUncertain] = useState(false);
    const [hunterParticipationUncertain, setHunterParticipationUncertain] = useState(false);
    const [isUncertain, setIsUncertain] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [verified, setVerified] = useState(false);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [rawData, setRawData] = useState("");
    const [rawDataGdsets, setRawDataGdsets] = useState("");

    // UI state
    const [error, setError] = useState("");

    // Dropdown data
    const [venues, setVenues] = useState<any[]>([]);
    const [eventTypes, setEventTypes] = useState<any[]>([]);
    const [contentTypes, setContentTypes] = useState<any[]>([]);
    const [bands, setBands] = useState<any[]>([]);

    useEffect(() => {
        loadEventData();
        loadDropdownData();
    }, [eventId]);

    async function loadEventData() {
        try {
            const res = await fetch(`/api/admin/events/${eventId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load event");

            const e = data.event;
            setYear(e.year || "");
            setMonth(e.month || "");
            setDay(e.day || "");
            setDisplayDate(e.displayDate || "");
            setShowTiming(e.showTiming || "");
            setVenueId(e.venueId || "");
            setEventTypeId(e.eventTypeId || "");
            setContentTypeId(e.contentTypeId || "");
            setPrimaryBandId(e.primaryBandId || "");
            setBilling(e.billing || "");
            setEtreeShowId(e.etreeShowId || "");
            setSlug(e.slug || "");
            setSortDate(e.sortDate ? e.sortDate.slice(0, 16) : "");
            setDateUncertain(e.dateUncertain || false);
            setVenueUncertain(e.venueUncertain || false);
            setHunterParticipationUncertain(e.hunterParticipationUncertain || false);
            setIsUncertain(e.isUncertain || false);
            setIsPublic(e.isPublic || false);
            setVerified(e.verified || false);
            setPublicNotes(e.publicNotes || "");
            setPrivateNotes(e.privateNotes || "");
            setRawData(e.rawData || "");
            setRawDataGdsets(e.rawDataGdsets || "");
        } catch (err: any) {
            setError(err.message || "Failed to load event");
        }
    }

    async function loadDropdownData() {
        try {
            const [venuesRes, eventTypesRes, contentTypesRes, bandsRes] = await Promise.all([
                fetch("/api/venues"),
                fetch("/api/event-types"),
                fetch("/api/content-types"),
                fetch("/api/bands")
            ]);

            const [venuesData, eventTypesData, contentTypesData, bandsData] = await Promise.all([
                venuesRes.json(),
                eventTypesRes.json(),
                contentTypesRes.json(),
                bandsRes.json()
            ]);

            setVenues(venuesData.venues || []);
            setEventTypes(eventTypesData.eventTypes || []);
            setContentTypes(contentTypesData.contentTypes || []);
            setBands(bandsData.bands || []);
        } catch (err) {
            console.error("Failed to load dropdown data:", err);
        }
    }

    // Regenerate slug from date fields (always, unless slug is blank)
    useEffect(() => {
        if (!year) return;

        const newSlug = generateSlug({
            year: Number(year),
            month: month ? Number(month) : null,
            day: day ? Number(day) : null,
            showTiming: showTiming || null
        });

        setSlug(newSlug);
    }, [year, month, day, showTiming]);

    useEffect(() => {
        if (!year) return;

        const yearNum = Number(year);
        const monthNum = month ? Number(month) : 1;
        const dayNum = day ? Number(day) : 1;

        const date = new Date(Date.UTC(yearNum, monthNum - 1, dayNum, 0, 0, 0));
        const isoString = date.toISOString().slice(0, 16);

        setSortDate(isoString);
    }, [year, month, day]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const body = {
                year: year ? Number(year) : null,
                month: month ? Number(month) : null,
                day: day ? Number(day) : null,
                displayDate,
                showTiming: showTiming || null,
                venueId: venueId ? Number(venueId) : null,
                eventTypeId: eventTypeId ? Number(eventTypeId) : null,
                contentTypeId: contentTypeId ? Number(contentTypeId) : null,
                primaryBandId: primaryBandId ? Number(primaryBandId) : null,
                billing,
                etreeShowId,
                publicNotes,
                privateNotes,
                rawData,
                rawDataGdsets,
                dateUncertain,
                venueUncertain,
                hunterParticipationUncertain,
                isUncertain,
                isPublic,
                verified,
                slug: slug || generateSlug({
                    year: Number(year),
                    month: month ? Number(month) : null,
                    day: day ? Number(day) : null,
                    showTiming: showTiming || null
                }),
                sortDate: sortDate ? new Date(sortDate + ':00.000Z').toISOString() : null
            };

            const res = await fetch(`/api/admin/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save event");

            showToast("Event saved successfully", "success");
            // Refetch to get server-resolved slug
            const refetchRes = await fetch(`/api/admin/events/${eventId}`);
            const refetchData = await refetchRes.json();
            if (refetchData.event) {
                setSlug(refetchData.event.slug || "");
                setSortDate(refetchData.event.sortDate ? refetchData.event.sortDate.slice(0, 16) : "");
            }
            onSaveSuccess(); // Call parent callback to reload header
        } catch (err: any) {
            setError(err.message || "Failed to save event");
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {error && <div className="form-error mb-4">{error}</div>}

            <div>
                <h2 className="text-lg font-semibold mb-4">Event Metadata</h2>

                {/* Row 1: Date fields */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="form-group">
                        <label className="form-label form-label-required">Year</label>
                        <input
                            type="number"
                            className="input"
                            value={year}
                            onChange={e => setYear(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Month</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            className="input"
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Day</label>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            className="input"
                            value={day}
                            onChange={e => setDay(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Display Date</label>
                        <input
                            type="text"
                            className="input"
                            value={displayDate}
                            onChange={e => setDisplayDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Show Timing</label>
                        <select
                            className="select"
                            value={showTiming}
                            onChange={e => setShowTiming(e.target.value)}
                        >
                            <option value="">—</option>
                            <option value="Early">Early</option>
                            <option value="Late">Late</option>
                        </select>
                    </div>
                </div>

                {/* Row 2: Relation fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="form-group">
                        <label className="form-label">Venue</label>
                        <select
                            className="select"
                            value={venueId}
                            onChange={e => setVenueId(e.target.value)}
                        >
                            <option value="">Select venue...</option>
                            {venues.map(venue => (
                                <option key={venue.id} value={venue.id}>
                                    {formatVenue(venue)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Event Type</label>
                        <select
                            className="select"
                            value={eventTypeId}
                            onChange={e => setEventTypeId(e.target.value)}
                        >
                            <option value="">Select type...</option>
                            {eventTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Content Type</label>
                        <select
                            className="select"
                            value={contentTypeId}
                            onChange={e => setContentTypeId(e.target.value)}
                        >
                            <option value="">Select type...</option>
                            {contentTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Primary Band</label>
                        <select
                            className="select"
                            value={primaryBandId}
                            onChange={e => setPrimaryBandId(e.target.value)}
                        >
                            <option value="">Solo / No Band</option>
                            {bands.map(band => (
                                <option key={band.id} value={band.id}>{band.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 3: Metadata fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="form-group">
                        <label className="form-label">Billing</label>
                        <input
                            type="text"
                            className="input"
                            value={billing}
                            onChange={e => setBilling(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">etree Show ID</label>
                        <input
                            type="text"
                            className="input"
                            value={etreeShowId}
                            onChange={e => setEtreeShowId(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Slug</label>
                        <input
                            type="text"
                            className="input"
                            value={slug}
                            onChange={e => setSlug(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Sort Date</label>
                        <input
                            type="datetime-local"
                            className="input"
                            value={sortDate}
                            onChange={e => setSortDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Row 4: Checkboxes */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={dateUncertain}
                            onChange={e => setDateUncertain(e.target.checked)}
                        />
                        Date Uncertain
                    </div>
                    <div className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={venueUncertain}
                            onChange={e => setVenueUncertain(e.target.checked)}
                        />
                        Venue Uncertain
                    </div>
                    <div className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={hunterParticipationUncertain}
                            onChange={e => setHunterParticipationUncertain(e.target.checked)}
                        />
                        Hunter Participation Uncertain
                    </div>
                    <div className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={isUncertain}
                            onChange={e => setIsUncertain(e.target.checked)}
                        />
                        Is Uncertain
                    </div>
                    <div className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={isPublic}
                            onChange={e => setIsPublic(e.target.checked)}
                        />
                        Is Public
                    </div>
                    <div className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox-input"
                            checked={verified}
                            onChange={e => setVerified(e.target.checked)}
                        />
                        Verified
                    </div>
                </div>

                {/* Notes */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="form-label">Public Notes</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={publicNotes}
                            onChange={e => setPublicNotes(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="form-label">Private Notes</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={privateNotes}
                            onChange={e => setPrivateNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Collapsible sections */}
                <details className="mb-4">
                    <summary className="cursor-pointer user-select-none font-medium mb-2">Raw Data</summary>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Raw Data</label>
                            <textarea
                                className="textarea"
                                rows={3}
                                value={rawData}
                                onChange={e => setRawData(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label">Raw Data GDSets</label>
                            <textarea
                                className="textarea"
                                rows={3}
                                value={rawDataGdsets}
                                onChange={e => setRawDataGdsets(e.target.value)}
                            />
                        </div>
                    </div>
                </details>

                <div className="flex gap-3 justify-end mt-6">
                    <button type="submit" className="btn btn-primary btn-medium">
                        Save Event
                    </button>
                </div>
            </div>
        </form>
    );
}