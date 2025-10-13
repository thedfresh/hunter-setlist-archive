import { useEffect, useState } from 'react';
import { generateSlugFromName } from '@/lib/utils/generateSlug';


interface AlbumFormProps {
    albumId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AlbumForm({ albumId, onSuccess, onCancel }: AlbumFormProps) {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [artist, setArtist] = useState('');
    const [releaseYear, setReleaseYear] = useState('');
    const [isOfficial, setIsOfficial] = useState(true);
    const [publicNotes, setPublicNotes] = useState('');
    const [privateNotes, setPrivateNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (albumId > 0) {
            setLoading(true);
            fetch(`/api/admin/albums/${albumId}`)
                .then(res => res.json())
                .then(data => {
                    setTitle(data.title || '');
                    setSlug(data.slug || '');
                    setArtist(data.artist || '');
                    setReleaseYear(data.releaseYear ? String(data.releaseYear) : '');
                    setIsOfficial(data.isOfficial ?? true);
                    setPublicNotes(data.publicNotes || '');
                    setPrivateNotes(data.privateNotes || '');
                })
                .catch(() => setError('Failed to load album'))
                .finally(() => setLoading(false));
        } else {
            setTitle('');
            setSlug('');
            setSlugManuallyEdited(false);
            setArtist('');
            setReleaseYear('');
            setIsOfficial(true);
            setPublicNotes('');
            setPrivateNotes('');
            setError('');
        }
    }, [albumId]);

    useEffect(() => {
        if (!slugManuallyEdited && title) {
            setSlug(generateSlugFromName(title));
        }
    }, [title, slugManuallyEdited]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                albumId > 0 ? `/api/admin/albums/${albumId}` : '/api/admin/albums',
                {
                    method: albumId > 0 ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title.trim(),
                        slug: slug.trim(),
                        artist: artist.trim(),
                        releaseYear: releaseYear ? Number(releaseYear) : null,
                        isOfficial,
                        publicNotes: publicNotes.trim(),
                        privateNotes: privateNotes.trim(),
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');
            onSuccess();
        } catch (err: any) {
            if (err?.message?.toLowerCase().includes('slug')) {
                setError('Slug must be unique');
            } else {
                setError(err?.message || 'Failed to save');
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
                <label className="form-label" htmlFor="artist">Artist</label>
                <input
                    id="artist"
                    className="input"
                    value={artist}
                    onChange={e => setArtist(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="releaseYear">Release Year</label>
                <input
                    id="releaseYear"
                    className="input"
                    type="number"
                    placeholder="YYYY"
                    value={releaseYear}
                    onChange={e => setReleaseYear(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        className="checkbox-input"
                        checked={isOfficial}
                        onChange={e => setIsOfficial(e.target.checked)}
                        disabled={loading}
                    />
                    Official Release
                </label>
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="publicNotes">Public Notes</label>
                <textarea
                    id="publicNotes"
                    className="textarea"
                    placeholder="Public notes (visible on site)"
                    value={publicNotes}
                    onChange={e => setPublicNotes(e.target.value)}
                    disabled={loading}
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label className="form-label" htmlFor="privateNotes">Private Notes</label>
                <textarea
                    id="privateNotes"
                    className="textarea"
                    placeholder="Private notes (admin only)"
                    value={privateNotes}
                    onChange={e => setPrivateNotes(e.target.value)}
                    disabled={loading}
                    rows={3}
                />
            </div>

            {error && <div className="form-error mb-4">{error}</div>}

            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {albumId > 0 ? 'Update' : 'Add'}
                    {loading && <span className="spinner ml-2"></span>}
                </button>
            </div>
        </form>
    );
}
