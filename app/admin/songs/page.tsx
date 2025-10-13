"use client";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { useToast } from "@/lib/hooks/useToast";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { generateSlugFromName } from "@/lib/utils/generateSlug";
import Link from "next/link";

export default function SongAdminDetailPage({ params }: { params: { id: string } }) {
    const songId = Number(params.id);
    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "",
        slug: "",
        slugManuallyEdited: false,
        alternateTitle: "",
        originalArtist: "",
        lyricsBy: "",
        musicBy: "",
        isUncertain: false,
        inBoxOfRain: false,
        publicNotes: "",
        privateNotes: "",
    });
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/songs/${songId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setSong(data.song);
                setForm({
                    title: data.song.title || "",
                    slug: data.song.slug || "",
                    slugManuallyEdited: false,
                    alternateTitle: data.song.alternateTitle || "",
                    originalArtist: data.song.originalArtist || "",
                    lyricsBy: data.song.lyricsBy || "",
                    musicBy: data.song.musicBy || "",
                    isUncertain: !!data.song.isUncertain,
                    inBoxOfRain: !!data.song.inBoxOfRain,
                    publicNotes: data.song.publicNotes || "",
                    privateNotes: data.song.privateNotes || "",
                });
                setError("");
            })
            .catch(err => {
                setError(err.message || "Failed to load song");
            })
            .finally(() => setLoading(false));
    }, [songId]);

    useEffect(() => {
        if (!form.slugManuallyEdited && form.title) {
            setForm(f => ({ ...f, slug: generateSlugFromName(f.title) }));
        }
    }, [form.title, form.slugManuallyEdited]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.title.trim()) {
            setError("Title is required");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/songs/${songId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    slug: form.slug.trim(),
                    alternateTitle: form.alternateTitle.trim(),
                    originalArtist: form.originalArtist.trim(),
                    lyricsBy: form.lyricsBy.trim(),
                    musicBy: form.musicBy.trim(),
                    isUncertain: form.isUncertain,
                    inBoxOfRain: form.inBoxOfRain,
                    publicNotes: form.publicNotes.trim(),
                    privateNotes: form.privateNotes.trim(),
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            showToast("Song updated", "success");
            fetch(`/api/songs/${songId}`)
                .then(res => res.json())
                .then(data => setSong(data.song));
        } catch (err: any) {
            if (err?.message?.toLowerCase().includes("slug")) {
                setError("Slug must be unique");
            } else {
                setError(err?.message || "Failed to save");
            }
            showToast("Failed to save song", "error");
        } finally {
            setSaving(false);
        }
    }

    const sortedPerformances = song?.performances
        ? [...song.performances].sort((a: any, b: any) => {
            const aDate = a.set?.event?.sortDate ? new Date(a.set.event.sortDate) : null;
            const bDate = b.set?.event?.sortDate ? new Date(b.set.event.sortDate) : null;
            if (aDate && bDate) return aDate.getTime() - bDate.getTime();
            return 0;
        })
        : [];

    return (
        <div>
            <Breadcrumbs items={[
                { label: "Home", href: "/admin" },
                { label: "Songs", href: "/admin/songs" },
                { label: song?.title || "Song" }
            ]} />

            <div className="page-header mb-6">
                <h1 className="page-title">{song?.title || "Song"}</h1>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading song...</div>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSave} className="mb-8">
                        {/* Row 1: Title, Slug, Alternate Title */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div>
                                <label className="form-label form-label-required" htmlFor="title">Title</label>
                                <input
                                    id="title"
                                    className="input"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    disabled={saving}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="slug">Slug</label>
                                <input
                                    id="slug"
                                    className="input"
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value, slugManuallyEdited: true }))}
                                    disabled={saving}
                                />
                                <p className="form-help">Auto-generated</p>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="alternateTitle">Alternate Title</label>
                                <input
                                    id="alternateTitle"
                                    className="input"
                                    value={form.alternateTitle}
                                    onChange={e => setForm(f => ({ ...f, alternateTitle: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Row 2: Original Artist, Lyrics By, Music By */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div>
                                <label className="form-label" htmlFor="originalArtist">Original Artist</label>
                                <input
                                    id="originalArtist"
                                    className="input"
                                    value={form.originalArtist}
                                    onChange={e => setForm(f => ({ ...f, originalArtist: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="lyricsBy">Lyrics By</label>
                                <input
                                    id="lyricsBy"
                                    className="input"
                                    value={form.lyricsBy}
                                    onChange={e => setForm(f => ({ ...f, lyricsBy: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="musicBy">Music By</label>
                                <input
                                    id="musicBy"
                                    className="input"
                                    value={form.musicBy}
                                    onChange={e => setForm(f => ({ ...f, musicBy: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Row 3: Checkboxes and Notes */}
                        <div className="grid grid-cols-3 gap-4 mb-5">
                            <div className="flex flex-col gap-3">
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
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="checkbox-input"
                                        checked={form.inBoxOfRain}
                                        onChange={e => setForm(f => ({ ...f, inBoxOfRain: e.target.checked }))}
                                        disabled={saving}
                                    />
                                    Box of Rain
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

                    <div className="section-header mb-4">All Performances ({sortedPerformances.length})</div>
                    {sortedPerformances.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Venue</th>
                                        <th>Event</th>
                                        <th>Set Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPerformances.map((perf: any) => (
                                        <tr key={perf.id}>
                                            <td>{perf.set?.event ? formatEventDate(perf.set.event) : "—"}</td>
                                            <td>
                                                {perf.set?.event?.venue
                                                    ? `${perf.set.event.venue.name}${perf.set.event.venue.city ? ", " + perf.set.event.venue.city : ""}`
                                                    : "—"}
                                            </td>
                                            <td>
                                                {perf.set?.event?.id ? (
                                                    <Link href={`/admin/events/${perf.set.event.id}`}>
                                                        <button className="btn btn-secondary btn-small">Edit Event</button>
                                                    </Link>
                                                ) : "—"}
                                            </td>
                                            <td>{perf.set?.setType?.displayName || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-title">No performances found</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}