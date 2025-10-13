import { useState, useEffect } from "react";

interface PerformanceEditorProps {
    eventId: number;
    setId: number;
    performanceId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PerformanceEditor({ eventId, setId, performanceId, onSuccess, onCancel }: PerformanceEditorProps) {
    const [songId, setSongId] = useState<number | null>(null);
    const [seguesInto, setSeguesInto] = useState(false);
    const [isTruncatedStart, setIsTruncatedStart] = useState(false);
    const [isTruncatedEnd, setIsTruncatedEnd] = useState(false);
    const [hasCuts, setHasCuts] = useState(false);
    const [isPartial, setIsPartial] = useState(false);
    const [isMedley, setIsMedley] = useState(false);
    const [isLyricalFragment, setIsLyricalFragment] = useState(false);
    const [isMusicalFragment, setIsMusicalFragment] = useState(false);
    const [isSoloHunter, setIsSoloHunter] = useState(false);
    const [isUncertain, setIsUncertain] = useState(false);
    const [leadVocalsId, setLeadVocalsId] = useState<number | null>(null);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [songs, setSongs] = useState<any[]>([]);
    const [musicians, setMusicians] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [songsRes, musiciansRes] = await Promise.all([
                    fetch("/api/songs"),
                    fetch("/api/musicians")
                ]);
                if (!songsRes.ok || !musiciansRes.ok) throw new Error();
                const songsData = await songsRes.json();
                const musiciansData = await musiciansRes.json();
                setSongs(songsData.songs || []);
                setMusicians(musiciansData.musicians || []);
            } catch {
                setError("Failed to load dropdowns");
            }
        }
        fetchDropdowns();
    }, []);

    useEffect(() => {
        if (performanceId) {
            setLoading(true);
            async function fetchPerformance() {
                try {
                    const res = await fetch(`/api/admin/events/${eventId}/sets/${setId}/performances`);
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    const perf = (data.performances || []).find((p: any) => p.id === performanceId);
                    if (perf) {
                        setSongId(perf.song?.id ?? null);
                        setSeguesInto(!!perf.seguesInto);
                        setIsTruncatedStart(!!perf.isTruncatedStart);
                        setIsTruncatedEnd(!!perf.isTruncatedEnd);
                        setHasCuts(!!perf.hasCuts);
                        setIsPartial(!!perf.isPartial);
                        setIsMedley(!!perf.isMedley);
                        setIsLyricalFragment(!!perf.isLyricalFragment);
                        setIsMusicalFragment(!!perf.isMusicalFragment);
                        setIsSoloHunter(!!perf.isSoloHunter);
                        setIsUncertain(!!perf.isUncertain);
                        setLeadVocalsId(perf.leadVocals?.id ?? null);
                        setPublicNotes(perf.publicNotes ?? "");
                        setPrivateNotes(perf.privateNotes ?? "");
                    }
                } catch {
                    setError("Failed to load performance data");
                } finally {
                    setLoading(false);
                }
            }
            fetchPerformance();
        } else {
            setSongId(null);
            setSeguesInto(false);
            setIsTruncatedStart(false);
            setIsTruncatedEnd(false);
            setHasCuts(false);
            setIsPartial(false);
            setIsMedley(false);
            setIsLyricalFragment(false);
            setIsMusicalFragment(false);
            setIsSoloHunter(false);
            setIsUncertain(false);
            setLeadVocalsId(null);
            setPublicNotes("");
            setPrivateNotes("");
            setError("");
        }
    }, [performanceId, eventId, setId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!songId) {
            setError("Song is required");
            setLoading(false);
            return;
        }
        try {
            const payload = {
                songId,
                seguesInto,
                isTruncatedStart,
                isTruncatedEnd,
                hasCuts,
                isPartial,
                isMedley,
                isLyricalFragment,
                isMusicalFragment,
                isSoloHunter,
                isUncertain,
                leadVocalsId: leadVocalsId || null,
                publicNotes,
                privateNotes
            };
            let res;
            if (performanceId) {
                res = await fetch(`/api/admin/events/${eventId}/sets/${setId}/performances/${performanceId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                res = await fetch(`/api/admin/events/${eventId}/sets/${setId}/performances`,
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
            setError("Error saving performance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="form-label form-label-required">Song</label>
                <select
                    className="select"
                    value={songId ?? ""}
                    onChange={e => setSongId(Number(e.target.value))}
                    required
                    autoFocus
                    disabled={loading}
                >
                    <option value="">Select song</option>
                    {songs.map((song: any) => (
                        <option key={song.id} value={song.id}>{song.title}</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2 mb-4">
                <div className="flex flex-col gap-2">
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={seguesInto} onChange={e => setSeguesInto(e.target.checked)} disabled={loading} />
                        Segues into next
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isTruncatedStart} onChange={e => setIsTruncatedStart(e.target.checked)} disabled={loading} />
                        Truncated start (//)
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isTruncatedEnd} onChange={e => setIsTruncatedEnd(e.target.checked)} disabled={loading} />
                        Truncated end (//)
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={hasCuts} onChange={e => setHasCuts(e.target.checked)} disabled={loading} />
                        Has cuts/edits
                    </label>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isPartial} onChange={e => setIsPartial(e.target.checked)} disabled={loading} />
                        Partial performance
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isMedley} onChange={e => setIsMedley(e.target.checked)} disabled={loading} />
                        Part of medley
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isLyricalFragment} onChange={e => setIsLyricalFragment(e.target.checked)} disabled={loading} />
                        Lyrical fragment
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isMusicalFragment} onChange={e => setIsMusicalFragment(e.target.checked)} disabled={loading} />
                        Musical fragment
                    </label>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isSoloHunter} onChange={e => setIsSoloHunter(e.target.checked)} disabled={loading} />
                        Solo Hunter
                    </label>
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" checked={isUncertain} onChange={e => setIsUncertain(e.target.checked)} disabled={loading} />
                        Uncertain
                    </label>
                </div>
            </div>
            <div>
                <label className="form-label">Lead Vocals</label>
                <select
                    className="select"
                    value={leadVocalsId ?? ""}
                    onChange={e => setLeadVocalsId(e.target.value ? Number(e.target.value) : null)}
                    disabled={loading}
                >
                    <option value="">Hunter (default)</option>
                    {musicians.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
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
