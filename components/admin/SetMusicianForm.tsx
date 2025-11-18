import { useState, useEffect, FormEvent } from "react";
import InstrumentChipSelector from "@/components/admin/InstrumentChipSelector";

interface SetMusicianFormProps {
    eventId: number;
    setId: number;
    musicianId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SetMusicianForm({ eventId, setId, musicianId, onSuccess, onCancel }: SetMusicianFormProps) {
    const [musicians, setMusicians] = useState<any[]>([]);
    const [selectedMusician, setSelectedMusician] = useState<number | "">(musicianId ?? "");
    const [selectedInstruments, setSelectedInstruments] = useState<any[]>([]);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            const musRes = await fetch("/api/musicians");
            const musData = await musRes.json();
            setMusicians(musData.musicians || []);
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedMusician && selectedInstruments.length === 0) {
            const musician = musicians.find(m => m.id === Number(selectedMusician));
            if (musician?.defaultInstruments && musician.defaultInstruments.length > 0) {
                const mapped = musician.defaultInstruments.map((di: any) => ({
                    id: di.instrument.id,
                    displayName: di.instrument.displayName
                }));
                setSelectedInstruments(mapped);
            }
        }
    }, [selectedMusician, musicians, selectedInstruments.length]);

    useEffect(() => {
        if (musicianId) {
            fetch(`/api/admin/events/${eventId}/sets/${setId}/musicians/${musicianId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setSelectedMusician(data.musicianId);
                        setPublicNotes(data.publicNotes ?? "");
                        setPrivateNotes(data.privateNotes ?? "");

                        if (data.instruments && data.instruments.length > 0) {
                            const mapped = data.instruments.map((si: any) => ({
                                id: si.instrument.id,
                                displayName: si.instrument.displayName
                            }));
                            setSelectedInstruments(mapped);
                        }
                    }
                });
        }
    }, [eventId, setId, musicianId]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (!selectedMusician) {
                setError("Musician is required");
                setLoading(false);
                return;
            }
            const payload = {
                musicianId: selectedMusician,
                instrumentIds: selectedInstruments.map(i => i.id),
                publicNotes,
                privateNotes,
            };
            let response;
            if (musicianId) {
                response = await fetch(`/api/admin/events/${eventId}/sets/${setId}/musicians/${musicianId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                response = await fetch(`/api/admin/events/${eventId}/sets/${setId}/musicians`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            const result = await response.json();
            if (!response.ok) {
                setError(result.error || "Failed to save set musician");
                setLoading(false);
                return;
            }
            onSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to save set musician");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
                <label className="form-label form-label-required">Musician</label>
                <select
                    className="select"
                    value={selectedMusician}
                    onChange={e => setSelectedMusician(Number(e.target.value))}
                    required
                    autoFocus
                    disabled={!!musicianId}
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

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="form-label">Public Notes</label>
                    <textarea
                        className="textarea"
                        value={publicNotes}
                        onChange={e => setPublicNotes(e.target.value)}
                        rows={2}
                    />
                </div>
                <div>
                    <label className="form-label">Private Notes</label>
                    <textarea
                        className="textarea"
                        value={privateNotes}
                        onChange={e => setPrivateNotes(e.target.value)}
                        rows={2}
                    />
                </div>
            </div>

            {error && <div className="form-error mb-2">{error}</div>}

            <div className="flex gap-2 justify-end">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {loading ? "Saving..." : musicianId ? "Update Set Musician" : "Add Set Musician"}
                </button>
            </div>
        </form>
    );
}