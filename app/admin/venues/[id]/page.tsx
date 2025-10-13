"use client";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { useToast } from "@/lib/hooks/useToast";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { generateVenueSlug } from "@/lib/utils/generateSlug";
import Link from "next/link";

export default function VenueAdminDetailPage({ params }: { params: { id: string } }) {
    const venueId = Number(params.id);
    const [venue, setVenue] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        slug: "",
        slugManuallyEdited: false,
        city: "",
        stateProvince: "",
        country: "",
        isUncertain: false,
        context: "",
        publicNotes: "",
        privateNotes: "",
    });
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    // Fetch venue data
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
                    slugManuallyEdited: false,
                    city: data.venue.city || "",
                    stateProvince: data.venue.stateProvince || "",
                    country: data.venue.country || "",
                    isUncertain: !!data.venue.isUncertain,
                    context: data.venue.context || "",
                    publicNotes: data.venue.publicNotes || "",
                    privateNotes: data.venue.privateNotes || "",
                });
                setError("");
            })
            .catch(err => {
                setError(err.message || "Failed to load venue");
            })
            .finally(() => setLoading(false));
    }, [venueId]);

    // Slug auto-generation
    useEffect(() => {
        if (!form.slugManuallyEdited && form.name) {
            setForm(f => ({
                ...f,
                slug: generateVenueSlug(f.name, f.city, f.stateProvince)
            }));
        }
    }, [form.name, form.city, form.stateProvince, form.slugManuallyEdited]);

    // Save handler
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
                    city: form.city.trim(),
                    stateProvince: form.stateProvince.trim(),
                    country: form.country.trim(),
                    isUncertain: form.isUncertain,
                    context: form.context.trim(),
                    publicNotes: form.publicNotes.trim(),
                    privateNotes: form.privateNotes.trim(),
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            showToast("Venue updated", "success");
            // Refresh data
            fetch(`/api/venues/${venueId}`)
                .then(res => res.json())
                .then(data => setVenue(data.venue));
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

    // Sort events by date
    const sortedEvents = venue?.events
        ? [...venue.events].sort((a: any, b: any) => {
            const aDate = a.sortDate ? new Date(a.sortDate) : null;
            const bDate = b.sortDate ? new Date(b.sortDate) : null;
            if (aDate && bDate) return aDate.getTime() - bDate.getTime();
            return 0;
        })
        : [];

    return (
        <div className="page-container">
            <Breadcrumbs items={[{ label: "Home", href: "/admin" }, { label: "Venues", href: "/admin/venues" }, { label: venue?.name || "Venue" }]} />
            <div className="page-header mb-4">
                <h1 className="page-title">{venue?.name || "Venue"}</h1>
            </div>
            {loading ? (
                <div className="loading-state"><div className="spinner"></div>Loading venue...</div>
            ) : error ? (
                <div className="form-error mb-4">{error}</div>
            ) : (
                <form onSubmit={handleSave} className="mb-8">
                    <div className="form-group">
                        <label className="form-label form-label-required" htmlFor="name">Name</label>
                        <input id="name" className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={saving} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="slug">Slug (URL-friendly identifier)</label>
                        <input id="slug" className="input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value, slugManuallyEdited: true }))} disabled={saving} />
                        <p className="form-help">Auto-generated from name, city, and state, but you can customize it</p>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="context">Context</label>
                        <input id="context" className="input" value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} disabled={saving} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="city">City</label>
                        <input id="city" className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} disabled={saving} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="stateProvince">State/Province</label>
                        <input id="stateProvince" className="input" value={form.stateProvince} onChange={e => setForm(f => ({ ...f, stateProvince: e.target.value }))} disabled={saving} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="country">Country</label>
                        <input id="country" className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} disabled={saving} />
                    </div>
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input type="checkbox" className="checkbox-input" checked={form.isUncertain} onChange={e => setForm(f => ({ ...f, isUncertain: e.target.checked }))} disabled={saving} />
                            Uncertain
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="context">Context</label>
                        <textarea id="context" className="textarea" value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} disabled={saving} rows={2} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="publicNotes">Public Notes</label>
                        <textarea id="publicNotes" className="textarea" value={form.publicNotes} onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))} disabled={saving} rows={2} />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="privateNotes">Private Notes</label>
                        <textarea id="privateNotes" className="textarea" value={form.privateNotes} onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))} disabled={saving} rows={2} />
                    </div>
                    {error && <div className="form-error mb-4">{error}</div>}
                    <div className="flex gap-3 justify-end mt-6">
                        <button type="submit" className="btn btn-primary btn-medium" disabled={saving}>Save</button>
                    </div>
                </form>
            )}
            <hr className="my-8" />
            <div className="section-header mb-4">All Events at This Venue</div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="cursor-pointer">Date</th>
                            <th>Performer</th>
                            <th>Event</th>
                            <th>Verified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedEvents.map((event: any) => (
                            <tr key={event.id}>
                                <td>{event ? formatEventDate(event) : "—"}</td>
                                <td>{event.primaryBand?.name || "Solo"}</td>
                                <td>
                                    <Link href={`/admin/events/${event.id}`}>
                                        <button className="btn btn-secondary btn-small">Edit Event</button>
                                    </Link>
                                </td>
                                <td className="text-center">{event.verified ? "✔️" : "❌"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedEvents.length === 0 && <div className="empty-state">No events found</div>}
            </div>
        </div>
    );
}
