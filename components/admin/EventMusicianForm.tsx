"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

interface EventMusicianFormProps {
    eventId: number;
    musicianId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function EventMusicianForm({ eventId, musicianId, onSuccess, onCancel }: EventMusicianFormProps) {
    const { showToast } = useToast();
    const [selectedMusicianId, setSelectedMusicianId] = useState<number | string>("");
    const [instrumentId, setInstrumentId] = useState<number | string>("");
    const [includesVocals, setIncludesVocals] = useState(false);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [musicians, setMusicians] = useState<any[]>([]);
    const [instruments, setInstruments] = useState<any[]>([]);

    useEffect(() => {
        fetchDropdowns();
        if (musicianId !== null) {
            fetchExisting();
        }
        // eslint-disable-next-line
    }, [musicianId]);

    async function fetchDropdowns() {
        try {
            const [musiciansRes, instrumentsRes] = await Promise.all([
                fetch("/api/musicians"),
                fetch("/api/instruments")
            ]);
            const musiciansData = await musiciansRes.json();
            const instrumentsData = await instrumentsRes.json();
            setMusicians(musiciansData.musicians || []);
            setInstruments(instrumentsData.instruments || []);
        } catch {
            showToast("Failed to load dropdowns", "error");
        }
    }

    async function fetchExisting() {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/musicians`);
            const data = await res.json();
            const found = (data.eventMusicians || []).find((em: any) => em.musicianId === musicianId);
            if (found) {
                setSelectedMusicianId(found.musicianId);
                setInstrumentId(found.instrumentId || "");
                setPublicNotes(found.publicNotes || "");
                setPrivateNotes(found.privateNotes || "");
                setIncludesVocals(found.includesVocals || false);
            }
        } catch {
            showToast("Failed to load musician data", "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const body = {
                musicianId: Number(selectedMusicianId),
                instrumentId: instrumentId ? Number(instrumentId) : null,
                publicNotes,
                privateNotes,
                includesVocals,
            };
            let res;
            if (musicianId === null) {
                res = await fetch(`/api/admin/events/${eventId}/musicians`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            } else {
                res = await fetch(`/api/admin/events/${eventId}/musicians/${musicianId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to save event musician");
            onSuccess();
        } catch (error: any) {
            setError(error?.message || "Failed to save event musician");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="form-error mb-4">{error}</div>}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                    <label className="form-label form-label-required">Musician</label>
                    <select
                        className="select"
                        value={selectedMusicianId}
                        onChange={e => setSelectedMusicianId(e.target.value)}
                        required
                        disabled={musicianId !== null}
                        autoFocus
                    >
                        <option value="">Select musician...</option>
                        {musicians.map(m => (
                            <option key={m.id} value={m.id}>{m.displayName || m.name}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Instrument</label>
                    <select
                        className="select"
                        value={instrumentId}
                        onChange={e => setInstrumentId(e.target.value)}
                    >
                        <option value="">No instrument</option>
                        {instruments.map(i => (
                            <option key={i.id} value={i.id}>{i.displayName}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={includesVocals}
                        onChange={e => setIncludesVocals(e.target.checked)}
                    />
                    Includes vocals
                </label>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="form-label">Public Notes</label>
                    <textarea
                        className="textarea"
                        rows={2}
                        value={publicNotes}
                        onChange={e => setPublicNotes(e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">Private Notes</label>
                    <textarea
                        className="textarea"
                        rows={2}
                        value={privateNotes}
                        onChange={e => setPrivateNotes(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </div>

        </form>
    );
}
