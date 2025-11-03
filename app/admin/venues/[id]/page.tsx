"use client";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { useToast } from "@/lib/hooks/useToast";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { generateVenueSlug } from "@/lib/utils/generateSlug";
import { useRouter } from 'next/navigation';

export default function VenueAdminDetailPage({ params }: { params: { id: string } }) {
    const venueId = Number(params.id);
    const [venue, setVenue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        slug: "",
        context: "",
        city: "",
        stateProvince: "",
        country: "",
        isUncertain: false,
        publicNotes: "",
        privateNotes: "",
    });
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/venues/${venueId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setVenue(data.venue);
                setForm({
                    name: data.venue.name || "",
                    slug: data.venue.slug || "",
                    context: data.venue.context || "",
                    city: data.venue.city || "",
                    stateProvince: data.venue.stateProvince || "",
                    country: data.venue.country || "",
                    isUncertain: !!data.venue.isUncertain,
                    publicNotes: data.venue.publicNotes || "",
                    privateNotes: data.venue.privateNotes || "",
                });
                setInitialLoadComplete(true);
                setError("");
            })
            .catch(err => {
                setError(err.message || "Failed to load venue");
            })
            .finally(() => setLoading(false));
    }, [venueId]);

    useEffect(() => {
        if (form.name && initialLoadComplete) {
            setForm(f => ({ ...f, slug: generateVenueSlug(form.name, form.city, form.stateProvince) }));
        }
    }, [form.name, form.city, form.stateProvince]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) {
            setError("Name is required");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/venues/${venueId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    slug: form.slug.trim(),
                    context: form.context.trim(),
                    city: form.city.trim(),
                    stateProvince: form.stateProvince.trim(),
                    country: form.country.trim(),
                    isUncertain: form.isUncertain,
                    publicNotes: form.publicNotes.trim(),
                    privateNotes: form.privateNotes.trim(),
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            showToast("Venue updated", "success");
            fetch(`/api/venues/${venueId}`)
                .then(res => res.json())
                .then(data => {
                    setVenue(data.venue);
                    setForm({
                        name: data.venue.name || "",
                        slug: data.venue.slug || "",
                        context: data.venue.context || "",
                        city: data.venue.city || "",
                        stateProvince: data.venue.stateProvince || "",
                        country: data.venue.country || "",
                        isUncertain: !!data.venue.isUncertain,
                        publicNotes: data.venue.publicNotes || "",
                        privateNotes: data.venue.privateNotes || "",
                    });
                });
        } catch (err: any) {
            if (err?.message?.toLowerCase().includes("slug")) {
                setError("Slug must be unique");
            } else {
                setError(err?.message || "Failed to save");
            }
            showToast("Failed to save venue", "error");
        } finally {
            setSaving(false);
        }
    }

    const sortedEvents = venue?.events
        ? [...venue.events].sort((a: any, b: any) => {
            const aDate = a.sortDate ? new Date(a.sortDate) : null;
            const bDate = b.sortDate ? new Date(b.sortDate) : null;
            if (aDate && bDate) return aDate.getTime() - bDate.getTime();
            return 0;
        })
        : [];

    return (
        <div>
            <Breadcrumbs items={[
                { label: "Home", href: "/admin" },
                { label: "Venues", href: "/admin/venues" },
                { label: venue?.name || "Venue" }
            ]} />

            <div className="page-header mb-6">
                <h1 className="page-title">{venue?.name || "Venue"}</h1>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading venue...</div>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSave} className="mb-8">
                        {/* Row 1: Name, Context, Slug */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div>
                                <label className="form-label form-label-required" htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    className="input"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    disabled={saving}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="context">Context</label>
                                <input
                                    id="context"
                                    className="input"
                                    value={form.context}
                                    onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="slug">Slug</label>
                                <input
                                    id="slug"
                                    className="input"
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    disabled={saving}
                                />
                                <p className="form-help">Auto-generated</p>
                            </div>
                        </div>

                        {/* Row 2: City, State, Country */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div>
                                <label className="form-label" htmlFor="city">City</label>
                                <input
                                    id="city"
                                    className="input"
                                    value={form.city}
                                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="stateProvince">State/Province</label>
                                <input
                                    id="stateProvince"
                                    className="input"
                                    value={form.stateProvince}
                                    onChange={e => setForm(f => ({ ...f, stateProvince: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="country">Country</label>
                                <input
                                    id="country"
                                    className="input"
                                    value={form.country}
                                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Row 3: Checkbox and Notes */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={form.isUncertain}
                                        onChange={e => setForm(f => ({ ...f, isUncertain: e.target.checked }))}
                                        disabled={saving}
                                    />
                                    Uncertain
                                </label>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="publicNotes">Public Notes</label>
                                <textarea
                                    id="publicNotes"
                                    className="textarea"
                                    value={form.publicNotes}
                                    onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))}
                                    disabled={saving}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="privateNotes">Private Notes</label>
                                <textarea
                                    id="privateNotes"
                                    className="textarea"
                                    value={form.privateNotes}
                                    onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
                                    disabled={saving}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {error && <div className="form-error mb-4">{error}</div>}

                        <div className="flex gap-3 justify-end mt-6">
                            <button type="submit" className="btn btn-primary btn-medium" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Saving...</> : 'Save Changes'}
                            </button>
                        </div>
                    </form>

                    <hr className="my-8" />

                    <div className="section-header mb-4">All Events at This Venue ({sortedEvents.length})</div>
                    {sortedEvents.length > 0 ? (
                        <div className="table-container inline-block">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Performer</th>
                                        <th className="text-center w-24">Verified</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedEvents.map((event: any) => (
                                        <tr
                                            key={event.id}
                                            onClick={() => router.push(`/admin/events/${event.id}`)}
                                            className="cursor-pointer hover:bg-gray-50"
                                        >
                                            <td>{event ? formatEventDate(event) : "—"}</td>
                                            <td>{event.primaryBand?.name || "Solo"}</td>
                                            <td className="text-center w-24">{event.verified ? "✔️" : "❌"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-title">No events found</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}