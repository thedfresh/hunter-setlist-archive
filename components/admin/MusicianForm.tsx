import { useEffect, useState } from 'react';
import { generateSlugFromName } from '@/lib/utils/generateSlug';

interface MusicianFormProps {
    musicianId: number;
    onSuccess: () => void;
    onCancel: () => void;
}


export default function MusicianForm({ musicianId, onSuccess, onCancel }: MusicianFormProps) {
    const [name, setName] = useState('');
    const [isUncertain, setIsUncertain] = useState(false);
    const [publicNotes, setPublicNotes] = useState('');
    const [privateNotes, setPrivateNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [slug, setSlug] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    useEffect(() => {
        if (musicianId > 0) {
            setLoading(true);
            fetch(`/api/admin/musicians/${musicianId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || '');
                    setIsUncertain(data.isUncertain ?? false);
                    setPublicNotes(data.publicNotes || '');
                    setPrivateNotes(data.privateNotes || '');
                    setSlug(data.slug || '');
                    setSlugManuallyEdited(false);
                })
                .catch(() => setError('Failed to load musician'))
                .finally(() => setLoading(false));
        } else {
            setName('');
            setIsUncertain(false);
            setPublicNotes('');
            setPrivateNotes('');
            setSlug('');
            setSlugManuallyEdited(false);
            setError('');
        }
    }, [musicianId]);

    useEffect(() => {
        if (!slugManuallyEdited && name) {
            setSlug(generateSlugFromName(name));
        }
    }, [name, slugManuallyEdited]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(
                musicianId > 0 ? `/api/admin/musicians/${musicianId}` : '/api/admin/musicians',
                {
                    method: musicianId > 0 ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.trim(),
                        slug: slug.trim(),
                        isUncertain,
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
                <label className="form-label form-label-required" htmlFor="name">Name</label>
                <input
                    id="name"
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    disabled={loading}
                    required
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
                <p className="form-help">Auto-generated from name, but you can customize it</p>
            </div>
            <div className="form-group flex items-center gap-2">
                <input
                    id="isUncertain"
                    type="checkbox"
                    className="checkbox-input"
                    checked={isUncertain}
                    onChange={e => setIsUncertain(e.target.checked)}
                    disabled={loading}
                />
                <label className="form-label" htmlFor="isUncertain">Uncertain/Unconfirmed</label>
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
                    {musicianId > 0 ? 'Update' : 'Add'}
                    {loading && <span className="spinner ml-2"></span>}
                </button>
            </div>
        </form>
    );
}
