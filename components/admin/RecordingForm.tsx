import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

interface RecordingFormProps {
    eventId: number;
    recordingId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

interface RecordingType {
    id: number;
    name: string;
}

export default function RecordingForm({ eventId, recordingId, onSuccess, onCancel }: RecordingFormProps) {
    const [recordingTypeId, setRecordingTypeId] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [taper, setTaper] = useState("");
    const [lmaIdentifier, setLmaIdentifier] = useState("");
    const [losslessLegsId, setLosslessLegsId] = useState("");
    const [youtubeVideoId, setYoutubeVideoId] = useState("");
    const [shnId, setShnId] = useState("");
    const [lengthMinutes, setLengthMinutes] = useState<string>("");
    const [featured, setFeatured] = useState<boolean>(false);
    const [featuredText, setFeaturedText] = useState("");
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [recordingTypes, setRecordingTypes] = useState<RecordingType[]>([]);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        async function fetchTypes() {
            try {
                const res = await fetch("/api/recording-types");
                if (!res.ok) throw new Error();
                const data = await res.json();
                setRecordingTypes(data.recordingTypes || []);
            } catch {
                setError("Failed to load recording types");
            }
        }
        fetchTypes();
    }, []);

    useEffect(() => {
        if (recordingId) {
            setLoading(true);
            async function fetchRecording() {
                try {
                    const res = await fetch(`/api/admin/events/${eventId}/recordings/${recordingId}`);
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    const r = data.recording;
                    setRecordingTypeId(r.recordingTypeId || null);
                    setDescription(r.description || "");
                    setTaper(r.taper || "");
                    setLmaIdentifier(r.lmaIdentifier || "");
                    setLosslessLegsId(r.losslessLegsId || "");
                    setYoutubeVideoId(r.youtubeVideoId || "");
                    setShnId(r.shnId || "");
                    setLengthMinutes(r.lengthMinutes ? String(r.lengthMinutes) : "");
                    setFeatured(!!r.featured);
                    setFeaturedText(r.featuredText || "");
                    setPublicNotes(r.publicNotes || "");
                    setPrivateNotes(r.privateNotes || "");
                } catch {
                    setError("Failed to load recording");
                } finally {
                    setLoading(false);
                }
            }
            fetchRecording();
        } else {
            setRecordingTypeId(null);
            setDescription("");
            setTaper("");
            setLmaIdentifier("");
            setLosslessLegsId("");
            setYoutubeVideoId("");
            setShnId("");
            setLengthMinutes("");
            setFeatured(false);
            setFeaturedText("");
            setPublicNotes("");
            setPrivateNotes("");
            setError("");
        }
    }, [recordingId, eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!recordingTypeId) {
            setError("Recording Type is required");
            setLoading(false);
            return;
        }
        try {
            const payload = {
                recordingTypeId,
                description,
                taper,
                lmaIdentifier,
                losslessLegsId,
                youtubeVideoId,
                shnId,
                lengthMinutes: lengthMinutes ? Number(lengthMinutes) : null,
                featured,
                featuredText,
                publicNotes,
                privateNotes,
            };
            let res;
            if (recordingId) {
                res = await fetch(`/api/admin/events/${eventId}/recordings/${recordingId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            } else {
                res = await fetch(`/api/admin/events/${eventId}/recordings`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    }
                );
            }
            if (!res.ok) throw new Error();
            showSuccess(recordingId ? "Recording updated" : "Recording added");
            onSuccess();
        } catch {
            setError("Error saving recording");
            showError("Error saving recording");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="form-error mb-2">{error}</div>}
            <div className="mb-4">
                <label className="form-label form-label-required">Recording Type</label>
                <select
                    className="select"
                    value={recordingTypeId ?? ""}
                    onChange={e => setRecordingTypeId(Number(e.target.value))}
                    disabled={loading}
                    required
                    autoFocus
                >
                    <option value="">Select type</option>
                    {recordingTypes.map(rt => (
                        <option key={rt.id} value={rt.id}>{rt.name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="form-label">Description</label>
                <input
                    type="text"
                    className="input"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={loading}
                    placeholder="Brief recording description"
                />
            </div>
            <div className="mb-4">
                <label className="form-label">Taper</label>
                <input
                    type="text"
                    className="input"
                    value={taper}
                    onChange={e => setTaper(e.target.value)}
                    disabled={loading}
                    placeholder="Name or source"
                />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="form-label">LMA Identifier</label>
                    <input
                        type="text"
                        className="input"
                        value={lmaIdentifier}
                        onChange={e => setLmaIdentifier(e.target.value)}
                        disabled={loading}
                        placeholder="e.g., hunter2025-10-13.sbd"
                    />
                </div>
                <div>
                    <label className="form-label">YouTube Video ID</label>
                    <input
                        type="text"
                        className="input"
                        value={youtubeVideoId}
                        onChange={e => setYoutubeVideoId(e.target.value)}
                        disabled={loading}
                        placeholder="e.g., dQw4w9WgXcQ"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="form-label">Lossless Legs ID</label>
                    <input
                        type="text"
                        className="input"
                        value={losslessLegsId}
                        onChange={e => setLosslessLegsId(e.target.value)}
                        disabled={loading}
                        placeholder="e.g., 12345"
                    />
                </div>
                <div>
                    <label className="form-label">SHN ID</label>
                    <input
                        type="text"
                        className="input"
                        value={shnId}
                        onChange={e => setShnId(e.target.value)}
                        disabled={loading}
                        placeholder="e.g., 67890"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="form-label">Length (minutes)</label>
                    <input
                        type="number"
                        className="input"
                        value={lengthMinutes}
                        onChange={e => setLengthMinutes(e.target.value)}
                        disabled={loading}
                        min={0}
                        placeholder="e.g., 120"
                    />
                </div>

            </div>
            <div className="mb-4">
                <div className="checkbox-label">
                    <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={featured}
                        onChange={e => setFeatured(e.target.checked)}
                        disabled={loading}
                    />
                    Featured Recording
                </div>
            </div>
            {featured && (
                <div className="mb-4">
                    <label className="form-label">Featured Text</label>
                    <textarea
                        className="textarea"
                        rows={2}
                        value={featuredText}
                        onChange={e => setFeaturedText(e.target.value)}
                        disabled={loading}
                        placeholder="Text to display with featured badge"
                    />
                </div>
            )}            <div className="grid grid-cols-2 gap-4 mb-2">
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
                    {recordingId ? "Update" : "Add"}
                </button>
            </div>
        </form>
    );
}
