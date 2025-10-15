import { useEffect, useState } from 'react';
import { generateSlugFromName } from '@/lib/utils/generateSlug';

interface BandFormProps {
    bandId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function BandForm({ bandId, onSuccess, onCancel }: BandFormProps) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [publicNotes, setPublicNotes] = useState('');
    const [privateNotes, setPrivateNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (bandId > 0) {
            setLoading(true);
            fetch(`/api/admin/bands/${bandId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || '');
                    setSlug(data.slug || '');
                    setPublicNotes(data.publicNotes || '');
                    setPrivateNotes(data.privateNotes || '');
                })
                .catch(() => setError('Failed to load band'))
                .finally(() => setLoading(false));
        } else {
            setName('');
            setSlug('');
            setPublicNotes('');
            setPrivateNotes('');
            setError('');
        }
    }, [bandId]);

    // Always regenerate slug from name (user can override by editing slug field)
    useEffect(() => {
        if (name) {
            setSlug(generateSlugFromName(name));
        }
    }, [name]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        setLoading(true);
        try {
            const finalSlug = slug.trim() || generateSlugFromName(name);
            const res = await fetch(
                bandId > 0 ? `/api/admin/bands/${bandId}` : '/api/admin/bands',
                {
                    method: bandId > 0 ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.trim(),
                        slug: finalSlug,
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
                <label className="form-label" htmlFor="slug">Slug (URL-friendly identifier)</label>
                <input
                    id="slug"
                    className="input"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    disabled={loading}
                />
                <p className="form-help">Auto-generated from name, but you can customize it</p>
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
                    {bandId > 0 ? 'Update' : 'Add'}
                    {loading && <span className="spinner ml-2"></span>}
                </button>
            </div>
        </form>
    );
}