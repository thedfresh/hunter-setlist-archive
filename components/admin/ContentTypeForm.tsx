import { useState, useEffect } from 'react';

interface Props {
    contentTypeId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ContentTypeForm({ contentTypeId, onSuccess, onCancel }: Props) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (contentTypeId > 0) {
            setLoading(true);
            fetch(`/api/admin/content-types/${contentTypeId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || '');
                })
                .catch(() => setError('Failed to load content type'))
                .finally(() => setLoading(false));
        } else {
            setName('');
        }
    }, [contentTypeId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const body = JSON.stringify({ name });
            const res = await fetch(contentTypeId === 0
                ? '/api/admin/content-types'
                : `/api/admin/content-types/${contentTypeId}`, {
                method: contentTypeId === 0 ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to save');
                setLoading(false);
                return;
            }
            onSuccess();
        } catch {
            setError('Failed to save');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
                <label className="form-label form-label-required" htmlFor="name">Name</label>
                <input
                    id="name"
                    className="input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    disabled={loading}
                />
            </div>
            {error && <div className="form-error mb-4">{error}</div>}
            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {loading ? <span className="spinner"></span> : 'Save'}
                </button>
            </div>
        </form>
    );
}
