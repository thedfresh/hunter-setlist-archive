import { useEffect, useState } from 'react';

interface TagFormProps {
    tagId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function TagForm({ tagId, onSuccess, onCancel }: TagFormProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tagId > 0) {
            setLoading(true);
            fetch(`/api/admin/tags/${tagId}`)
                .then(res => res.json())
                .then(data => {
                    setName(data.name || '');
                    setDescription(data.description || '');
                })
                .catch(() => setError('Failed to load tag'))
                .finally(() => setLoading(false));
        } else {
            setName('');
            setDescription('');
            setError('');
        }
    }, [tagId]);

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
                tagId > 0 ? `/api/admin/tags/${tagId}` : '/api/admin/tags',
                {
                    method: tagId > 0 ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), description: description.trim() }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');
            onSuccess();
        } catch (err: any) {
            if (err?.message?.includes('unique')) {
                setError('Tag name must be unique');
            } else {
                setError(err?.message || 'Failed to save');
            }
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
            <label className="form-label mt-4" htmlFor="description">Description</label>
            <textarea
                id="description"
                className="textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
            />
            {error && <div className="form-error mb-4">{error}</div>}
            <div className="flex gap-3 justify-end mt-6">
                <button type="button" className="btn btn-secondary btn-medium" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-medium" disabled={loading}>
                    {tagId > 0 ? 'Update' : 'Add'}
                    {loading && <span className="spinner ml-2"></span>}
                </button>
            </div>
        </form>
    );
}
