import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

interface ShowBanterFormProps {
    eventId: number;
    banterId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

interface Performance {
    id: number;
    song: { title: string };
    set: { setType: { name: string } };
}

interface ShowBanter {
    id: number;
    performanceId: number;
    banterText: string;
    isBeforeSong: boolean;
    isVerbatim: boolean;
    publicNotes?: string;
    privateNotes?: string;
}

export default function ShowBanterForm({ eventId, banterId, onSuccess, onCancel }: ShowBanterFormProps) {
    const [performanceId, setPerformanceId] = useState<number | null>(null);
    const [banterText, setBanterText] = useState("");
    const [isBeforeSong, setIsBeforeSong] = useState(false);
    const [isVerbatim, setIsVerbatim] = useState(false);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [performances, setPerformances] = useState<Performance[]>([]);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        async function fetchPerformances() {
            try {
                const res = await fetch(`/api/admin/events/${eventId}`);
                if (!res.ok) throw new Error();
                const data = await res.json();
                const event = data.event;

                // Extract all performances from all sets
                const allPerfs: Performance[] = [];
                if (event.sets) {
                    event.sets.forEach((set: any) => {
                        if (set.performances) {
                            set.performances.forEach((perf: any) => {
                                allPerfs.push({
                                    id: perf.id,
                                    song: perf.song,
                                    set: { setType: set.setType }
                                });
                            });
                        }
                    });
                }
                setPerformances(allPerfs);
            } catch {
                setError("Failed to load performances");
            }
        }
        fetchPerformances();
    }, [eventId]);

    useEffect(() => {
        if (banterId) {
            setLoading(true);
            async function fetchBanter() {
                try {
                    const res = await fetch(`/api/admin/events/${eventId}/banter`);
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    const banter = (data.showBanter || []).find((b: any) => b.id === banterId);
                    if (banter) {
                        setPerformanceId(banter.performanceId);
                        setBanterText(banter.banterText || "");
                        setIsBeforeSong(!!banter.isBeforeSong);
                        setIsVerbatim(!!banter.isVerbatim);
                        setPublicNotes(banter.publicNotes || "");
                        setPrivateNotes(banter.privateNotes || "");
                    }
                } catch {
                    setError("Failed to load banter");
                } finally {
                    setLoading(false);
                }
            }
            fetchBanter();
        } else {
            setPerformanceId(null);
            setBanterText("");
            setIsBeforeSong(false);
            setIsVerbatim(false);
            setPublicNotes("");
            setPrivateNotes("");
            setError("");
        }
    }, [banterId, eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!performanceId || !banterText) {
            setError("Performance and banter text are required");
            setLoading(false);
            return;
        }
        try {
            const payload = {
                performanceId,
                banterText,
                isBeforeSong,
                isVerbatim,
                publicNotes,
                privateNotes,
            };
            let res;
            if (banterId) {
                res = await fetch(`/api/admin/events/${eventId}/banter/${banterId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                res = await fetch(`/api/admin/events/${eventId}/banter`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            }
            if (!res.ok) throw new Error();
            showSuccess(banterId ? "Show banter updated" : "Show banter added");
            onSuccess();
        } catch {
            setError("Error saving show banter");
            showError("Error saving show banter");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="form-error mb-2">{error}</div>}
            <div className="mb-4">
                <label className="form-label form-label-required">Performance</label>
                <select
                    className="select"
                    value={performanceId ?? ""}
                    onChange={e => setPerformanceId(Number(e.target.value))}
                    disabled={loading}
                    required
                    autoFocus
                >
                    <option value="">Select performance</option>
                    {performances.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.set?.setType?.name ?? "Set"}: {p.song?.title ?? "Unknown Song"}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="form-label">Timing</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="timing"
                            checked={!isBeforeSong}
                            onChange={() => setIsBeforeSong(false)}
                            disabled={loading}
                        />
                        After Song
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="timing"
                            checked={isBeforeSong}
                            onChange={() => setIsBeforeSong(true)}
                            disabled={loading}
                        />
                        Before Song
                    </label>
                </div>
            </div>
            <div className="mb-4">
                <label className="form-label form-label-required">Banter Text</label>
                <textarea
                    className="textarea"
                    rows={6}
                    value={banterText}
                    onChange={e => setBanterText(e.target.value)}
                    disabled={loading}
                    required
                />
            </div>
            <div className="mb-4">
                <div className="checkbox-label">
                    <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={isVerbatim}
                        onChange={e => setIsVerbatim(e.target.checked)}
                        disabled={loading}
                    />
                    Verbatim transcript
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                    <label className="form-label">Public Notes</label>
                    <textarea
                        className="textarea"
                        value={publicNotes}
                        onChange={e => setPublicNotes(e.target.value)}
                        disabled={loading}
                        rows={2}
                    />
                </div>
                <div>
                    <label className="form-label">Private Notes</label>
                    <textarea
                        className="textarea"
                        value={privateNotes}
                        onChange={e => setPrivateNotes(e.target.value)}
                        disabled={loading}
                        rows={2}
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {banterId ? "Update" : "Add"}
                </button>
            </div>
        </form>
    );
}
