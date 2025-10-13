import { useEffect, useState } from "react";
import { generateVenueSlug } from "@/lib/utils/generateSlug";

interface VenueFormProps {
    venueId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function VenueForm({ venueId, onSuccess, onCancel }: VenueFormProps) {
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [city, setCity] = useState("");
    const [stateProvince, setStateProvince] = useState("");
    const [country, setCountry] = useState("");
    const [isUncertain, setIsUncertain] = useState(false);
    const [context, setContext] = useState("");
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (venueId > 0) {
            setLoading(true);
            fetch(`/api/admin/venues/${venueId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || "");
                    setSlug(data.slug || "");
                    setSlugManuallyEdited(false);
                    setCity(data.city || "");
                    setStateProvince(data.stateProvince || "");
                    setCountry(data.country || "");
                    setIsUncertain(!!data.isUncertain);
                    setContext(data.context || "");
                    setPublicNotes(data.publicNotes || "");
                    setPrivateNotes(data.privateNotes || "");
                })
                .catch(() => setError("Failed to load venue"))
                .finally(() => setLoading(false));
        } else {
            setName("");
            setSlug("");
            setSlugManuallyEdited(false);
            setCity("");
            setStateProvince("");
            setCountry("");
            setIsUncertain(false);
            setContext("");
            setPublicNotes("");
            setPrivateNotes("");
            setError("");
        }
    }, [venueId]);

    useEffect(() => {
        if (!slugManuallyEdited && name) {
            setSlug(generateVenueSlug(name, city, stateProvince));
        }
    }, [name, city, stateProvince, slugManuallyEdited]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                venueId > 0 ? `/api/admin/venues/${venueId}` : "/api/admin/venues",
                {
                    method: venueId > 0 ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        slug: slug.trim(),
                        city: city.trim(),
                        stateProvince: stateProvince.trim(),
                        country: country.trim(),
                        isUncertain,
                        context: context.trim(),
                        publicNotes: publicNotes.trim(),
                        privateNotes: privateNotes.trim(),
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            onSuccess();
        } catch (err: any) {
            if (err?.message?.toLowerCase().includes("slug")) {
                setError("Slug must be unique");
            } else {
                setError(err?.message || "Failed to save");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label form-label-required" htmlFor="name">Name</label>
                <input
                    id="name"
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="context">Context</label>
                <input
                    id="context"
                    className="input"
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="slug">Slug (URL-friendly identifier)</label>
                <input
                    id="slug"
                    className="input"
                    value={slug}
                    onChange={e => {
                        setSlug(e.target.value);
                        setSlugManuallyEdited(true);
                    }}
                    disabled={loading}
                />
                <p className="form-help">Auto-generated from name, city, and state, but you can customize it</p>
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input
                    id="city"
                    className="input"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="stateProvince">State/Province</label>
                <input
                    id="stateProvince"
                    className="input"
                    value={stateProvince}
                    onChange={e => setStateProvince(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="country">Country</label>
                <input
                    id="country"
                    className="input"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={isUncertain}
                        onChange={e => setIsUncertain(e.target.checked)}
                        disabled={loading}
                    />
                    Uncertain
                </label>
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="publicNotes">Public Notes</label>
                <textarea
                    id="publicNotes"
                    className="textarea"
                    value={publicNotes}
                    onChange={e => setPublicNotes(e.target.value)}
                    disabled={loading}
                    rows={2}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="privateNotes">Private Notes</label>
                <textarea
                    id="privateNotes"
                    className="textarea"
                    value={privateNotes}
                    onChange={e => setPrivateNotes(e.target.value)}
                    disabled={loading}
                    rows={2}
                />
            </div>
            {error && <div className="form-error mb-4">{error}</div>}
            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {venueId > 0 ? "Update" : "Add"}
                    {loading && <span className="spinner ml-2"></span>}
                </button>
            </div>
        </form>
    );
}
