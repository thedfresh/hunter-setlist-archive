import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

interface Props {
    onSuccess: (eventId: number) => void;
    onCancel: () => void;
}

export default function CreateEventForm({ onSuccess, onCancel }: Props) {
    const [year, setYear] = useState<number | "">("");
    const [month, setMonth] = useState<number | "">("");
    const [day, setDay] = useState<number | "">("");
    const [displayDate, setDisplayDate] = useState<string>("");
    const [showTiming, setShowTiming] = useState<string>("");
    const [venueId, setVenueId] = useState<string>("");
    const [primaryBandId, setPrimaryBandId] = useState<string>("");
    const [eventTypeId, setEventTypeId] = useState<number | null>(null);
    const [contentTypeId, setContentTypeId] = useState<number | null>(null);
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [dateUncertain, setDateUncertain] = useState<boolean>(false);
    const [venueUncertain, setVenueUncertain] = useState<boolean>(false);
    const [isUncertain, setIsUncertain] = useState<boolean>(false);
    const [hunterParticipationUncertain, setHunterParticipationUncertain] = useState<boolean>(false);
    const [verified, setVerified] = useState<boolean>(false);
    const [venues, setVenues] = useState<any[]>([]);
    const [bands, setBands] = useState<any[]>([]);
    const [eventTypes, setEventTypes] = useState<any[]>([]);
    const [contentTypes, setContentTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [vRes, bRes, etRes, ctRes] = await Promise.all([
                    fetch("/api/venues"),
                    fetch("/api/bands"),
                    fetch("/api/event-types"),
                    fetch("/api/content-types")
                ]);
                const vData = await vRes.json();
                const bData = await bRes.json();
                const etData = await etRes.json();
                const ctData = await ctRes.json();

                const hunterBand = bData.bands?.find((b: any) => b.name === "Robert Hunter");
                if (hunterBand) setPrimaryBandId(String(hunterBand.id));

                // Set default Event Type to "Public Performance"
                const publicPerformanceType = etData.eventTypes?.find((et: any) => et.name === "Public Performance");
                if (publicPerformanceType) setEventTypeId(publicPerformanceType.id);

                // Set default Content Type to "Music"
                const musicType = ctData.contentTypes?.find((ct: any) => ct.name === "Music");
                if (musicType) setContentTypeId(musicType.id);

                setVenues(vData.venues || []);
                setBands(bData.bands || []);
                setEventTypes(etData.eventTypes || []);
                setContentTypes(ctData.contentTypes || []);
            } catch {
                setError("Failed to load dropdowns");
            }
        }
        fetchDropdowns();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!year || !month || !day || !venueId) {
            setError("Year, month, day, and venue are required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/admin/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year: Number(year),
                    month: Number(month),
                    day: Number(day),
                    displayDate: displayDate || null,
                    showTiming: showTiming || null,
                    venueId: Number(venueId),
                    primaryBandId: primaryBandId ? Number(primaryBandId) : null,
                    eventTypeId,
                    contentTypeId,
                    isPublic,
                    dateUncertain,
                    venueUncertain,
                    isUncertain,
                    hunterParticipationUncertain,
                    verified
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create event");
            showSuccess("Event created");
            onSuccess(data.event.id);
        } catch (err: any) {
            setError(err?.message || "Failed to create event");
            showError(err?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="form-error mb-4">{error}</div>}

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="form-label form-label-required">Year</label>
                    <input className="input" type="number" value={year} onChange={e => setYear(Number(e.target.value))} required autoFocus />
                </div>
                <div>
                    <label className="form-label form-label-required">Month</label>
                    <input className="input" type="number" value={month} onChange={e => setMonth(Number(e.target.value))} required min={1} max={12} />
                </div>
                <div>
                    <label className="form-label form-label-required">Day</label>
                    <input className="input" type="number" value={day} onChange={e => setDay(Number(e.target.value))} required min={1} max={31} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="form-label">Display Date</label>
                    <input className="input" type="text" value={displayDate} onChange={e => setDisplayDate(e.target.value)} placeholder="e.g., Early 1976" />
                </div>
                <div>
                    <label className="form-label">Show Timing</label>
                    <select className="select" value={showTiming} onChange={e => setShowTiming(e.target.value)}>
                        <option value="">—</option>
                        <option value="Early">Early</option>
                        <option value="Late">Late</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="form-label form-label-required">Venue</label>
                <select className="select" value={venueId} onChange={e => setVenueId(e.target.value)} required>
                    <option value="">Select venue...</option>
                    {venues.map(v => (
                        <option key={v.id} value={v.id}>
                            {v.name}
                            {v.context && ` (${v.context})`}
                            {v.city && `, ${v.city}`}
                            {v.stateProvince && `, ${v.stateProvince}`}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-4">
                <div>
                    <label className="form-label">Band</label>
                    <select className="select" value={primaryBandId} onChange={e => setPrimaryBandId(e.target.value)}>
                        <option value="1">Robert Hunter</option>
                        {bands.filter(b => b.id !== 1).map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="form-label">Event Type</label>
                    <select className="select" value={eventTypeId ?? ""} onChange={e => setEventTypeId(e.target.value ? Number(e.target.value) : null)}>
                        <option value="">—</option>
                        {eventTypes.map(et => (
                            <option key={et.id} value={et.id}>{et.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="form-label">Content Type</label>
                    <select className="select" value={contentTypeId ?? ""} onChange={e => setContentTypeId(e.target.value ? Number(e.target.value) : null)}>
                        <option value="">—</option>
                        {contentTypes.map(ct => (
                            <option key={ct.id} value={ct.id}>{ct.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                    Public
                </label>
                <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" checked={dateUncertain} onChange={e => setDateUncertain(e.target.checked)} />
                    Date Uncertain
                </label>
                <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" checked={venueUncertain} onChange={e => setVenueUncertain(e.target.checked)} />
                    Venue Uncertain
                </label>
                <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" checked={isUncertain} onChange={e => setIsUncertain(e.target.checked)} />
                    Uncertain
                </label>
                <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" checked={hunterParticipationUncertain} onChange={e => setHunterParticipationUncertain(e.target.checked)} />
                    Hunter Participation Uncertain
                </label>
                <label className="checkbox-label">
                    <input type="checkbox" className="checkbox-input" checked={verified} onChange={e => setVerified(e.target.checked)} />
                    Verified
                </label>
            </div>

            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    Create Event
                </button>
            </div>
        </form>
    );
}