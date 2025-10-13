import { useState, useEffect, FormEvent } from "react";

interface SetMusicianFormProps {
    eventId: number;
    setId: number;
    musicianId?: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SetMusicianForm({ eventId, setId, musicianId, onSuccess, onCancel }: SetMusicianFormProps) {
    const [musicians, setMusicians] = useState<any[]>([]);
    const [instruments, setInstruments] = useState<any[]>([]);
    const [selectedMusician, setSelectedMusician] = useState<number | "">(musicianId ?? "");
    const [selectedInstrument, setSelectedInstrument] = useState<number | "">("");
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch all musicians and instruments
        async function fetchData() {
            const [musRes, instRes] = await Promise.all([
                fetch("/api/musicians"),
                fetch("/api/instruments"),
            ]);
            const musData = await musRes.json();
            const instData = await instRes.json();
            setMusicians(musData.musicians || []);
            setInstruments(instData.instruments || []);
        }
        fetchData();
    }, []);

    useEffect(() => {
        // If editing, fetch existing set musician
        if (musicianId) {
            fetch(`/api/admin/events/${eventId}/sets/${setId}/musicians/${musicianId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setSelectedMusician(data.musicianId);
                        setSelectedInstrument(data.instrumentId ?? "");
                        setPublicNotes(data.publicNotes ?? "");
                        setPrivateNotes(data.privateNotes ?? "");
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
            } const payload = {
                musicianId: selectedMusician,
                instrumentId: selectedInstrument || null,
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
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="form-label">Musician</label>
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
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="form-label">Instrument</label>
                    <select
                        className="select"
                        value={selectedInstrument}
                        onChange={e => setSelectedInstrument(Number(e.target.value))}
                    >
                        <option value="">None</option>
                        {instruments.map(i => (
                            <option key={i.id} value={i.id}>{i.displayName}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="form-label">Public Notes</label>
                    <textarea
                        className="textarea"
                        value={publicNotes}
                        onChange={e => setPublicNotes(e.target.value)}
                        rows={2}
                    />
                </div>
                <div className="flex-1">
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
