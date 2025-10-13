import { useState, useEffect } from "react";

interface SetFormProps {
    eventId: number;
    setId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SetForm({ eventId, setId, onSuccess, onCancel }: SetFormProps) {
    const [setTypeId, setSetTypeId] = useState<number | null>(null);
    const [position, setPosition] = useState<number | string>("");
    const [bandId, setBandId] = useState<number | null>(null);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [isUncertain, setIsUncertain] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [setTypes, setSetTypes] = useState<any[]>([]);
    const [bands, setBands] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [setTypesRes, bandsRes] = await Promise.all([
                    fetch("/api/set-types"),
                    fetch("/api/bands")
                ]);
                if (!setTypesRes.ok || !bandsRes.ok) throw new Error();
                const setTypesData = await setTypesRes.json();
                const bandsData = await bandsRes.json();
                setSetTypes(setTypesData.setTypes || []);
                setBands(bandsData.bands || []);
            } catch {
                setError("Failed to load dropdowns");
            }
        }
        fetchDropdowns();
    }, []);

    useEffect(() => {
        if (setId) {
            setLoading(true);
            async function fetchSet() {
                try {
                    const res = await fetch(`/api/admin/events/${eventId}/sets/${setId}`);
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    setSetTypeId(data.setType?.id ?? null);
                    setPosition(data.position ?? "");
                    setBandId(data.band?.id ?? null);
                    setPublicNotes(data.publicNotes ?? "");
                    setPrivateNotes(data.privateNotes ?? "");
                    setIsUncertain(!!data.isUncertain);
                } catch {
                    setError("Failed to load set data");
                } finally {
                    setLoading(false);
                }
            }
            fetchSet();
        } else {
            setSetTypeId(null);
            setPosition("");
            setBandId(null);
            setPublicNotes("");
            setPrivateNotes("");
            setIsUncertain(false);
            setError("");
        }
    }, [setId, eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!setTypeId || !position) {
            setError("Set type and position are required");
            setLoading(false);
            return;
        }
        try {
            const payload = {
                setTypeId,
                position: Number(position),
                bandId,
                publicNotes,
                privateNotes,
                isUncertain
            };
            let res;
            if (setId) {
                res = await fetch(`/api/admin/events/${eventId}/sets/${setId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                res = await fetch(`/api/admin/events/${eventId}/sets`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            }
            if (!res.ok) throw new Error();
            onSuccess();
        } catch {
            setError("Error saving set");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="form-label form-label-required">Set Type</label>
                    <select
                        className="select"
                        value={setTypeId ?? ""}
                        onChange={e => setSetTypeId(Number(e.target.value))}
                        required
                        autoFocus
                        disabled={loading}
                    >
                        <option value="">Select set type</option>
                        {setTypes.map((type: any) => (
                            <option key={type.id} value={type.id}>{type.displayName || type.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="form-label form-label-required">Position</label>
                    <input
                        className="input"
                        type="number"
                        min={1}
                        value={position}
                        onChange={e => setPosition(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>
            </div>
            <div>
                <label className="form-label">Band</label>
                <select
                    className="select"
                    value={bandId ?? ""}
                    onChange={e => setBandId(e.target.value ? Number(e.target.value) : null)}
                    disabled={loading}
                >
                    <option value="">None</option>
                    {bands.map((band: any) => (
                        <option key={band.id} value={band.id}>{band.name}</option>
                    ))}
                </select>
            </div>
            <div className="checkbox-label">
                <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isUncertain}
                    onChange={e => setIsUncertain(e.target.checked)}
                    disabled={loading}
                />
                Uncertain set
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="form-label">Public Notes</label>
                    <textarea
                        className="textarea"
                        rows={2}
                        value={publicNotes}
                        onChange={e => setPublicNotes(e.target.value)}
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="form-label">Private Notes</label>
                    <textarea
                        className="textarea"
                        rows={2}
                        value={privateNotes}
                        onChange={e => setPrivateNotes(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>
            {error && <div className="form-error mb-4">{error}</div>}
            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    Save
                </button>
            </div>
        </form>
    );
}
