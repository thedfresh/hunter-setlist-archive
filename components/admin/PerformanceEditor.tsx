import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import SongForm from "@/components/admin/SongForm";

interface PerformanceEditorProps {
    eventId: number;
    setId: number;
    performanceId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PerformanceEditor({ eventId, setId, performanceId, onSuccess, onCancel }: PerformanceEditorProps) {
    const handleSaveMusician = async () => {
        if (!selectedMusicianId) return;
        const res = await fetch(`/api/admin/performances/${performanceId}/musicians`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                musicianId: selectedMusicianId,
                instrumentId: selectedInstrumentId,
                includesVocals: selectedIncludesVocals
            })
        });
        if (res.ok) {
            const data = await fetch(`/api/admin/performances/${performanceId}/musicians`).then(r => r.json());
            setPerformanceMusicians(data.performanceMusicians || []);
            setShowAddMusician(false);
            setSelectedMusicianId(null);
            setSelectedInstrumentId(null);
            setSelectedIncludesVocals(false);
        }
    };

    const handleEditMusician = (pm: any) => {
        setEditingMusicianId(pm.id);
        setEditInstrumentId(pm.instrumentId);
        setEditIncludesVocals(pm.includesVocals || false);
    };

    const handleSaveEdit = async () => {
        if (!editingMusicianId) return;
        const payload = {
            instrumentId: editInstrumentId,
            includesVocals: editIncludesVocals
        };
        const res = await fetch(`/api/admin/performances/${performanceId}/musicians/${editingMusicianId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const data = await fetch(`/api/admin/performances/${performanceId}/musicians`).then(r => r.json());
            setPerformanceMusicians(data.performanceMusicians || []);
            setEditingMusicianId(null);
            setEditInstrumentId(null);
            setEditIncludesVocals(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingMusicianId(null);
        setEditInstrumentId(null);
        setEditIncludesVocals(false);
    };

    const handleDeleteMusician = async (id: number) => {
        if (!confirm('Delete this musician?')) return;
        await fetch(`/api/admin/performances/${performanceId}/musicians/${id}`, { method: 'DELETE' });
        const data = await fetch(`/api/admin/performances/${performanceId}/musicians`).then(r => r.json());
        setPerformanceMusicians(data.performanceMusicians || []);
        onSuccess();
    };
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
    const [instruments, setInstruments] = useState<any[]>([]);
    const [performanceMusicians, setPerformanceMusicians] = useState<any[]>([]);
    const [showAddMusician, setShowAddMusician] = useState(false);
    const [selectedMusicianId, setSelectedMusicianId] = useState<number | null>(null);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState<number | null>(null);
    const [songModalOpen, setSongModalOpen] = useState(false);
    const songSelectRef = useRef<HTMLSelectElement>(null);
    const [editingMusicianId, setEditingMusicianId] = useState<number | null>(null);
    const [editInstrumentId, setEditInstrumentId] = useState<number | null>(null);
    const [editIncludesVocals, setEditIncludesVocals] = useState(false);
    const [selectedIncludesVocals, setSelectedIncludesVocals] = useState(false);

    useEffect(() => {
        if (performanceId) {
            fetch(`/api/admin/performances/${performanceId}/musicians`)
                .then(res => res.json())
                .then(data => setPerformanceMusicians(data.performanceMusicians || []));
        }
    }, [performanceId]);

    useEffect(() => {
        if (!performanceId && songs.length > 0 && songSelectRef.current) {
            setTimeout(() => {
                songSelectRef.current?.focus();
            }, 100);
        }
    }, [songs, performanceId]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                const [songsRes, musiciansRes, instrumentsRes] = await Promise.all([
                    fetch("/api/songs"),
                    fetch("/api/musicians"),
                    fetch("/api/instruments")
                ]);
                if (!songsRes.ok || !musiciansRes.ok || !instrumentsRes.ok) throw new Error();
                const songsData = await songsRes.json();
                const musiciansData = await musiciansRes.json();
                const instrumentsData = await instrumentsRes.json();
                setSongs(songsData.songs || []);
                setMusicians(musiciansData.musicians || []);
                setInstruments(instrumentsData.instruments || []);
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

    useEffect(() => {
        if (selectedMusicianId && !selectedInstrumentId) {
            const musician = musicians.find(m => m.id === selectedMusicianId);
            if (musician?.defaultInstrumentId) {
                setSelectedInstrumentId(musician.defaultInstrumentId);
            }
        }
    }, [selectedMusicianId, musicians]);

    async function refreshSongs() {
        try {
            const res = await fetch("/api/songs");
            const data = await res.json();
            setSongs(data.songs || []);
        } catch {
            setError("Failed to refresh songs");
        }
    }

    async function handleSongCreated(newSongId?: number) {
        await refreshSongs();
        if (newSongId) {
            setSongId(newSongId);
        }
        setSongModalOpen(false);
        setTimeout(() => {
            songSelectRef.current?.focus();
        }, 100);
    }

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
                <div className="flex gap-2">
                    <select
                        ref={songSelectRef}
                        className="select flex-1"
                        value={songId ?? ""}
                        onChange={e => setSongId(Number(e.target.value))}
                        required
                        disabled={loading}
                    >
                        <option value="">Select song</option>
                        {songs.map((song: any) => (
                            <option key={song.id} value={song.id}>{song.title}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="btn btn-secondary btn-medium !bg-green-50 !text-green-700 hover:!bg-green-100"
                        onClick={() => setSongModalOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
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

            {/* Performance Musicians Section */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium">Performance Musicians ({performanceMusicians.length})</h3>
                    {!showAddMusician && (
                        <button
                            type="button"
                            className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                            onClick={() => setShowAddMusician(true)}
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                </div>
                {performanceMusicians.map(pm => (
                    <div key={pm.id} className="flex items-center gap-2 py-1.5 text-sm">
                        {editingMusicianId === pm.id ? (
                            <>
                                <span className="font-medium">{pm.musician.displayName || pm.musician.name}:</span>
                                <select
                                    className="select input-small flex-1"
                                    value={editInstrumentId ?? ""}
                                    onChange={e => setEditInstrumentId(Number(e.target.value) || null)}
                                >
                                    <option value="">No instrument</option>
                                    {instruments.map(i => <option key={i.id} value={i.id}>{i.displayName}</option>)}
                                </select>
                                <label className="checkbox-label text-xs">
                                    <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={editIncludesVocals}
                                        onChange={e => setEditIncludesVocals(e.target.checked)}
                                    />
                                    + vocals
                                </label>
                                <button type="button" className="btn btn-primary btn-small" onClick={handleSaveEdit}>
                                    Save
                                </button>
                                <button type="button" className="btn btn-secondary btn-small" onClick={handleCancelEdit}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <span className="flex-1">
                                    {pm.musician.displayName || pm.musician.name}
                                    {pm.instrument && ` on ${pm.instrument.displayName}`}
                                    {pm.includesVocals && ' and vocals'}
                                </span>
                                <button type="button" className="btn btn-secondary btn-small" onClick={() => handleEditMusician(pm)}>
                                    Edit
                                </button>
                                <button type="button" className="btn btn-danger btn-small" onClick={() => handleDeleteMusician(pm.id)}>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                ))}

                {showAddMusician && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <select className="select" value={selectedMusicianId ?? ""} onChange={e => setSelectedMusicianId(Number(e.target.value))}>
                            <option value="">Select musician</option>
                            {musicians.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <select className="select" value={selectedInstrumentId ?? ""} onChange={e => setSelectedInstrumentId(Number(e.target.value))}>
                            <option value="">Select instrument</option>
                            {instruments.map(i => <option key={i.id} value={i.id}>{i.displayName}</option>)}
                        </select>
                        <label className="checkbox-label col-span-2">
                            <input
                                type="checkbox"
                                className="checkbox-input"
                                checked={selectedIncludesVocals}
                                onChange={e => setSelectedIncludesVocals(e.target.checked)}
                            />
                            + vocals
                        </label>
                        <div></div>
                        <div className="flex gap-2">
                            <button type="button" className="btn btn-secondary btn-small flex-1" onClick={() => setShowAddMusician(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary btn-small flex-1" onClick={handleSaveMusician}>Save</button>
                        </div>
                    </div>
                )}
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
            <Modal
                isOpen={songModalOpen}
                onClose={() => setSongModalOpen(false)}
                title="Create New Song"
                zIndex={1100}
            >
                <SongForm
                    songId={0}
                    onSuccess={handleSongCreated}
                    onCancel={() => setSongModalOpen(false)}
                />
            </Modal>
        </form>

    );
}
