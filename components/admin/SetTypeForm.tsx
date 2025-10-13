import { useState, useEffect } from 'react';

interface Props {
    setTypeId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function SetTypeForm({ setTypeId, onSuccess, onCancel }: Props) {
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [includeInStats, setIncludeInStats] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (setTypeId > 0) {
            setLoading(true);
            fetch(`/api/admin/set-types/${setTypeId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || '');
                    setDisplayName(data.displayName || '');
                    setIncludeInStats(data.includeInStats ?? true);
                })
                .catch(() => setError('Failed to load set type'))
                .finally(() => setLoading(false));
        } else {
            setName('');
            setDisplayName('');
            setIncludeInStats(true);
        }
    }, [setTypeId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const body = JSON.stringify({ name, displayName, includeInStats });
            const res = await fetch(setTypeId === 0
                ? '/api/admin/set-types'
                : `/api/admin/set-types/${setTypeId}`, {
                method: setTypeId === 0 ? 'POST' : 'PUT',
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
            <div className="form-group">
                <label className="form-label form-label-required" htmlFor="displayName">Display Name</label>
                <input
                    id="displayName"
                    className="input"
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    required
                    autoFocus
                    disabled={loading}
                />
            </div>
            <div className="form-group">
                <label className="checkbox-label">
                    <input
                        id="includeInStats"
                        type="checkbox"
                        checked={includeInStats}
                        onChange={e => setIncludeInStats(e.target.checked)}
                        disabled={loading}
                        className="checkbox-input"
                    />
                    Include in Statistics
                </label>
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
