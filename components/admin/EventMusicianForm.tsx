"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";
import InstrumentChipSelector from "@/components/admin/InstrumentChipSelector";

interface EventMusicianFormProps {
    eventId: number;
    musicianId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function EventMusicianForm({ eventId, musicianId, onSuccess, onCancel }: EventMusicianFormProps) {
    const { showToast } = useToast();
    const [selectedMusicianId, setSelectedMusicianId] = useState<number | string>("");
    const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [musicians, setMusicians] = useState<any[]>([]);

    useEffect(() => {
        fetchDropdowns();
        if (musicianId !== null) {
            fetchExisting();
        }
    }, [musicianId]);

    useEffect(() => {
        if (selectedMusicianId && selectedInstruments.length === 0) {
            const musician = musicians.find(m => m.id === Number(selectedMusicianId));
            if (musician?.defaultInstruments && musician.defaultInstruments.length > 0) {
                const mapped = musician.defaultInstruments.map((di: any) => ({
                    id: di.instrument.id,
                    displayName: di.instrument.displayName
                }));
                setSelectedInstruments(mapped);
            }
        }
    }, [selectedMusicianId, musicians, selectedInstruments.length]);

    async function fetchDropdowns() {
        try {
            const musiciansRes = await fetch("/api/musicians");
            const musiciansData = await musiciansRes.json();
            setMusicians(musiciansData.musicians || []);
        } catch {
            showToast("Failed to load musicians", "error");
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
                setPublicNotes(found.publicNotes || "");
                setPrivateNotes(found.privateNotes || "");

                if (found.instruments && found.instruments.length > 0) {
                    const mapped = found.instruments.map((ei: any) => ({
                        id: ei.instrument.id,
                        displayName: ei.instrument.displayName
                    }));
                    setSelectedInstruments(mapped);
                }
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
                instrumentIds: selectedInstruments.map(i => i.id),
                publicNotes,
                privateNotes,
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
                <label className="form-label">Instruments</label>
                <InstrumentChipSelector
                    selectedInstruments={selectedInstruments}
                    onChange={setSelectedInstruments}
                    disabled={loading}
                />
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