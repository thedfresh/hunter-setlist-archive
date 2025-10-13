import { useState, useEffect } from 'react';

interface Props {
    eventTypeId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function EventTypeForm({ eventTypeId, onSuccess, onCancel }: Props) {
    const [name, setName] = useState('');
    const [includeInStats, setIncludeInStats] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (eventTypeId > 0) {
            setLoading(true);
            fetch(`/api/admin/event-types/${eventTypeId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || '');
                    setIncludeInStats(data.includeInStats ?? true);
                })
                .catch(() => setError('Failed to load event type'))
                .finally(() => setLoading(false));
        } else {
            setName('');
            setIncludeInStats(true);
        }
    }, [eventTypeId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const body = JSON.stringify({ name, includeInStats });
            const res = await fetch(eventTypeId === 0
                ? '/api/admin/event-types'
                : `/api/admin/event-types/${eventTypeId}`, {
                method: eventTypeId === 0 ? 'POST' : 'PUT',
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
