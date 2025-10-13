import { useEffect, useState } from "react";
import { useToast } from "@/lib/hooks/useToast";

interface BandMemberFormProps {
    bandId: number;
    membershipId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function BandMemberForm({ bandId, membershipId, onSuccess, onCancel }: BandMemberFormProps) {
    const [musicianId, setMusicianId] = useState<number>(0);
    const [joinedDate, setJoinedDate] = useState("");
    const [leftDate, setLeftDate] = useState("");
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [musicians, setMusicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { showToast } = useToast();

    useEffect(() => {
        fetch("/api/musicians")
            .then(res => res.json())
            .then(data => setMusicians(data.musicians || []));
        if (membershipId > 0) {
            setLoading(true);
            fetch(`/api/admin/band-musicians/${membershipId}`)
                .then(res => res.json())
                .then(data => {
                    setMusicianId(data.musicianId);
                    setJoinedDate(data.joinedDate ? data.joinedDate.slice(0, 10) : "");
                    setLeftDate(data.leftDate ? data.leftDate.slice(0, 10) : "");
                    setPublicNotes(data.publicNotes || "");
                    setPrivateNotes(data.privateNotes || "");
                })
                .catch(() => setError("Failed to load member details"))
                .finally(() => setLoading(false));
        }
    }, [membershipId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const body: any = {
                bandId,
                musicianId,
                joinedDate: joinedDate || null,
                leftDate: leftDate || null,
                publicNotes,
                privateNotes,
            };
            let res, data;
            if (membershipId === 0) {
                res = await fetch("/api/admin/band-musicians", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            } else {
                res = await fetch(`/api/admin/band-musicians/${membershipId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
            }
            data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            showToast("Member saved", "success");
            onSuccess();
        } catch (err: any) {
            setError(err?.message || "Failed to save member");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="form-error mb-2">{error}</div>}
            <div className="form-group">
                <label className="form-label">Musician</label>
                <select
                    className="select"
                    value={musicianId}
                    onChange={e => setMusicianId(Number(e.target.value))}
                    required
                    disabled={membershipId > 0}
                >
                    <option value="">Select musician...</option>
                    {musicians.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label className="form-label">Joined Date</label>
                <input
                    type="date"
                    className="input"
                    value={joinedDate}
                    onChange={e => setJoinedDate(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Left Date</label>
                <input
                    type="date"
                    className="input"
                    value={leftDate}
                    onChange={e => setLeftDate(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Public Notes</label>
                <textarea
                    className="textarea"
                    value={publicNotes}
                    onChange={e => setPublicNotes(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label">Private Notes</label>
                <textarea
                    className="textarea"
                    value={privateNotes}
                    onChange={e => setPrivateNotes(e.target.value)}
                />
            </div>
            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>Save</button>
            </div>
        </form>
    );
}
