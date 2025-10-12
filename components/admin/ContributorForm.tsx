import { useEffect, useState } from 'react';

interface ContributorFormProps {
    contributorId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ContributorForm({ contributorId, onSuccess, onCancel }: ContributorFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [publicNotes, setPublicNotes] = useState('');
    const [privateNotes, setPrivateNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (contributorId > 0) {
            setLoading(true);
            fetch(`/api/admin/contributors/${contributorId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || '');
                    setEmail(data.email || '');
                    setPublicNotes(data.publicNotes || '');
                    setPrivateNotes(data.privateNotes || '');
                })
                .catch(() => setError('Failed to load contributor'))
                .finally(() => setLoading(false));
        } else {
            setName('');
            setEmail('');
            setPublicNotes('');
            setPrivateNotes('');
            setError('');
        }
    }, [contributorId]);

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
                contributorId > 0 ? `/api/admin/contributors/${contributorId}` : '/api/admin/contributors',
                {
                    method: contributorId > 0 ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
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
            <label className="form-label form-label-required" htmlFor="name">Name</label>
            <input
                id="name"
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                required
            />
            <label className="form-label mt-4" htmlFor="email">Email</label>
            <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
            />
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
                    {contributorId > 0 ? 'Update' : 'Add'}
                    {loading && <span className="spinner ml-2"></span>}
                </button>
            </div>
        </form>
    );
}
