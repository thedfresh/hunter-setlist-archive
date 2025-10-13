import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

interface EventContributorFormProps {
    eventId: number;
    contributorId: number | null;
    onSuccess: () => void;
    onCancel: () => void;
}

interface Contributor {
    id: number;
    name: string;
}

export default function EventContributorForm({ eventId, contributorId, onSuccess, onCancel }: EventContributorFormProps) {
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [description, setDescription] = useState<string>("");
    const [publicNotes, setPublicNotes] = useState<string>("");
    const [privateNotes, setPrivateNotes] = useState<string>("");
    const [selectedContributorId, setSelectedContributorId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        async function fetchContributors() {
            try {
                const res = await fetch("/api/contributors");
                if (!res.ok) throw new Error("Failed to fetch contributors");
                const data = await res.json();
                setContributors(data.contributors || []);
            } catch (err) {
                console.error("Failed to load contributors");
            }
        }
        fetchContributors();
    }, []);

    useEffect(() => {
        if (contributorId) {
            async function fetchContributor() {
                setLoading(true);
                try {
                    const res = await fetch(`/api/admin/events/${eventId}/contributors`);
                    if (!res.ok) throw new Error();
                    const data = await res.json();
                    const contributor = (data.eventContributors || []).find((c: any) => c.id === contributorId);
                    if (contributor) {
                        setDescription(contributor.description || "");
                        setPublicNotes(contributor.publicNotes || "");
                        setPrivateNotes(contributor.privateNotes || "");
                        setSelectedContributorId(contributor.contributorId);
                    }
                } catch {
                    showError("Error loading contributor");
                } finally {
                    setLoading(false);
                }
            }
            fetchContributor();
        } else {
            setDescription("");
            setPublicNotes("");
            setPrivateNotes("");
            setSelectedContributorId(null);
        }
    }, [contributorId, eventId, showError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedContributorId) {
            showError("Please select a contributor");
            return;
        }
        setLoading(true);
        try {
            const payload = {
                contributorId: selectedContributorId,
                description,
                publicNotes,
                privateNotes,
            };
            let res;
            if (contributorId) {
                res = await fetch(`/api/admin/events/${eventId}/contributors/${contributorId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetch(`/api/admin/events/${eventId}/contributors`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            if (!res.ok) throw new Error();
            showSuccess(contributorId ? "Contributor updated" : "Contributor added");
            onSuccess();
        } catch {
            showError("Error saving contributor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="form-label">Contributor</label>
                    <select
                        className="select"
                        value={selectedContributorId ?? ""}
                        onChange={e => setSelectedContributorId(Number(e.target.value))}
                        disabled={loading}
                        autoFocus
                    >
                        <option value="">Select contributor</option>
                        {contributors.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="form-label">Description</label>
                    <input
                        type="text"
                        className="input"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        disabled={loading}
                        placeholder="e.g., Setlist provided by, Tape source"
                    />
                </div>
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
            <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {contributorId ? "Update" : "Add"}
                </button>
            </div>
        </form>
    );
}
