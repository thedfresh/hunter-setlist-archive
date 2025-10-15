import { useEffect, useState } from "react";
import { generateSlugFromName } from "@/lib/utils/generateSlug";

interface SongFormProps {
    songId: number;
    onSuccess: (newSongId?: number) => void;
    onCancel: () => void;
}

export default function SongForm({ songId, onSuccess, onCancel }: SongFormProps) {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [alternateTitle, setAlternateTitle] = useState("");
    const [originalArtist, setOriginalArtist] = useState("");
    const [lyricsBy, setLyricsBy] = useState("");
    const [musicBy, setMusicBy] = useState("");
    const [isUncertain, setIsUncertain] = useState(false);
    const [inBoxOfRain, setInBoxOfRain] = useState(false);
    const [publicNotes, setPublicNotes] = useState("");
    const [privateNotes, setPrivateNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (songId > 0) {
            setLoading(true);
            fetch(`/api/admin/songs/${songId}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title || "");
                    setSlug(data.slug || "");
                    setAlternateTitle(data.alternateTitle || "");
                    setOriginalArtist(data.originalArtist || "");
                    setLyricsBy(data.lyricsBy || "");
                    setMusicBy(data.musicBy || "");
                    setIsUncertain(!!data.isUncertain);
                    setInBoxOfRain(!!data.inBoxOfRain);
                    setPublicNotes(data.publicNotes || "");
                    setPrivateNotes(data.privateNotes || "");
                })
                .catch(() => setError("Failed to load song"))
                .finally(() => setLoading(false));
        } else {
            setTitle("");
            setSlug("");
            setSlugManuallyEdited(false);
            setAlternateTitle("");
            setOriginalArtist("");
            setLyricsBy("");
            setMusicBy("");
            setIsUncertain(false);
            setInBoxOfRain(false);
            setPublicNotes("");
            setPrivateNotes("");
            setError("");
        }
    }, [songId]);

    useEffect(() => {
        if (!slugManuallyEdited && title) {
            setSlug(generateSlugFromName(title));
        }
    }, [title, slugManuallyEdited]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        e.stopPropagation();
        setError("");
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                songId > 0 ? `/api/admin/songs/${songId}` : "/api/admin/songs",
                {
                    method: songId > 0 ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim(),
                        slug: slug.trim(),
                        alternateTitle: alternateTitle.trim(),
                        originalArtist: originalArtist.trim(),
                        lyricsBy: lyricsBy.trim(),
                        musicBy: musicBy.trim(),
                        isUncertain,
                        inBoxOfRain,
                        publicNotes: publicNotes.trim(),
                        privateNotes: privateNotes.trim(),
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            onSuccess(songId > 0 ? songId : data.song?.id || data.id);
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
                <label className="form-label form-label-required" htmlFor="title">Title</label>
                <input
                    id="title"
                    className="input"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={loading}
                    required
                    autoFocus
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
                <p className="form-help">Auto-generated from title, but you can customize it</p>
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="alternateTitle">Alternate Title</label>
                <input
                    id="alternateTitle"
                    className="input"
                    value={alternateTitle}
                    onChange={e => setAlternateTitle(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="originalArtist">Original Artist</label>
                <input
                    id="originalArtist"
                    className="input"
                    value={originalArtist}
                    onChange={e => setOriginalArtist(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="lyricsBy">Lyrics By</label>
                <input
                    id="lyricsBy"
                    className="input"
                    value={lyricsBy}
                    onChange={e => setLyricsBy(e.target.value)}
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="musicBy">Music By</label>
                <input
                    id="musicBy"
                    className="input"
                    value={musicBy}
                    onChange={e => setMusicBy(e.target.value)}
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
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={inBoxOfRain}
                        onChange={e => setInBoxOfRain(e.target.checked)}
                        disabled={loading}
                    />
                    Appears in Box of Rain
                </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            {error && <div className="form-error mb-4">{error}</div>}
            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {songId > 0 ? "Update" : "Add"}
                    {loading && <span className="spinner ml-2"></span>}
                </button>
            </div>
        </form>
    );
}
