import { useEffect, useState } from 'react';
import { generateSlugFromName } from '@/lib/utils/generateSlug';

interface MusicianFormProps {
    musicianId: number;
    onSuccess: () => void;
    onCancel: () => void;
}


export default function MusicianForm({ musicianId, onSuccess, onCancel }: MusicianFormProps) {
    const [name, setName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [defaultInstrumentId, setDefaultInstrumentId] = useState<number | null>(null);
    const [instruments, setInstruments] = useState<any[]>([]);
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
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    setDefaultInstrumentId(data.defaultInstrumentId ?? null);
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
            setFirstName('');
            setLastName('');
            setDefaultInstrumentId(null);
            setIsUncertain(false);
            setPublicNotes('');
            setPrivateNotes('');
            setSlug('');
            setSlugManuallyEdited(false);
            setError('');
        }
        // Fetch instruments
        fetch('/api/instruments')
            .then(res => res.json())
            .then(data => setInstruments(data.instruments || []));
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
                        firstName: firstName.trim() || null,
                        lastName: lastName.trim() || null,
                        defaultInstrumentId,
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
                    autoFocus
                />
            </div>

            <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                    type="text"
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Leave blank for stage names"
                    disabled={loading}
                />
                <div className="form-help">Optional - used for sorting only</div>
            </div>

            <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                    type="text"
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Leave blank for stage names"
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Default Instrument</label>
                <select
                    className="select"
                    value={defaultInstrumentId || ''}
                    onChange={(e) => setDefaultInstrumentId(e.target.value ? parseInt(e.target.value) : null)}
                    disabled={loading}
                >
                    <option value="">None</option>
                    {instruments.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.displayName}</option>
                    ))}
                </select>
                <div className="form-help">Auto-fills when adding to performances</div>
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
