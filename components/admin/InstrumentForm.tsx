import React, { useState, useEffect } from 'react';

interface InstrumentFormProps {
    instrumentId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const InstrumentForm: React.FC<InstrumentFormProps> = ({ instrumentId, onSuccess, onCancel }) => {
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (instrumentId > 0) {
            setLoading(true);
            fetch(`/api/admin/instruments/${instrumentId}`)
                .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch instrument'))
                .then(data => {
                    setName(data.name || '');
                    setDisplayName(data.displayName || '');
                    setError(null);
                })
                .catch(() => setError('Failed to load instrument'))
                .finally(() => setLoading(false));
        } else {
            setName('');
            setDisplayName('');
            setError(null);
        }
    }, [instrumentId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const body = JSON.stringify({ name, displayName });
            let res;
            if (instrumentId === 0) {
                res = await fetch('/api/admin/instruments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                });
            } else {
                res = await fetch(`/api/admin/instruments/${instrumentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                });
            }
            if (!res.ok) throw new Error('Save failed');
            onSuccess();
        } catch (err) {
            setError('Failed to save instrument');
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
                    disabled={loading}
                />
            </div>
            {error && <div className="form-error">{error}</div>}
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {loading ? <span className="spinner"></span> : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default InstrumentForm;
