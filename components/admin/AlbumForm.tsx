import { useEffect, useState } from 'react';

interface AlbumFormProps {
    albumId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function AlbumForm({ albumId, onSuccess, onCancel }: AlbumFormProps) {
    const [title, setTitle] = useState('');
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
            setArtist('');
            setReleaseYear('');
            setIsOfficial(true);
            setPublicNotes('');
            setPrivateNotes('');
            setError('');
        }
    }, [albumId]);

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
            setError(err?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <label className="form-label form-label-required" htmlFor="title">Title</label>
            <input
                id="title"
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
                required
            />
            <label className="form-label mt-4" htmlFor="artist">Artist</label>
            <input
                id="artist"
                className="input"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                disabled={loading}
            />
            <label className="form-label mt-4" htmlFor="releaseYear">Release Year</label>
            <input
                id="releaseYear"
                className="input"
                type="number"
                placeholder="YYYY"
                value={releaseYear}
                onChange={e => setReleaseYear(e.target.value)}
                disabled={loading}
            />
            <label className="checkbox-label mt-4">
                <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={isOfficial}
                    onChange={e => setIsOfficial(e.target.checked)}
                    disabled={loading}
                />
                Official Release
            </label>
            <label className="form-label mt-4" htmlFor="publicNotes">Public Notes</label>
            <textarea
                id="publicNotes"
                className="textarea"
                placeholder="Public notes (visible on site)"
                value={publicNotes}
                onChange={e => setPublicNotes(e.target.value)}
                disabled={loading}
                rows={3}
            />
            <label className="form-label mt-4" htmlFor="privateNotes">Private Notes</label>
            <textarea
                id="privateNotes"
                className="textarea"
                placeholder="Private notes (admin only)"
                value={privateNotes}
                onChange={e => setPrivateNotes(e.target.value)}
                disabled={loading}
                rows={3}
            />
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
