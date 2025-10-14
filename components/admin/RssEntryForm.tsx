import React, { useEffect, useState } from 'react';

interface RssEntryFormProps {
    entryId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

interface RssEntry {
    id: number;
    title: string;
    description: string;
    link?: string;
    pubDate: string;
    isPublished: boolean;
}

const RssEntryForm: React.FC<RssEntryFormProps> = ({ entryId, onSuccess, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [pubDate, setPubDate] = useState(() => new Date().toISOString().slice(0, 16));
    const [isPublished, setIsPublished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (entryId > 0) {
            setLoading(true);
            fetch(`/api/admin/rss-entries/${entryId}`)
                .then(res => res.ok ? res.json() : Promise.reject(res))
                .then((data: RssEntry) => {
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setLink(data.link || '');
                    setPubDate(data.pubDate ? data.pubDate.slice(0, 16) : new Date().toISOString().slice(0, 16));
                    setIsPublished(!!data.isPublished);
                })
                .catch(() => setError('Failed to load entry.'))
                .finally(() => setLoading(false));
        }
    }, [entryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            return;
        }
        setLoading(true);
        const payload = {
            title,
            description,
            link: link || undefined,
            pubDate: pubDate ? new Date(pubDate).toISOString() : undefined,
            isPublished,
        };
        const method = entryId > 0 ? 'PUT' : 'POST';
        const url = entryId > 0 ? `/api/admin/rss-entries/${entryId}` : '/api/admin/rss-entries';
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to save entry.');
            } else {
                onSuccess();
            }
        } catch {
            setError('Failed to save entry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="w-full" onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label" htmlFor="rss-title">Title</label>
                <input
                    id="rss-title"
                    className="input"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    autoFocus
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="rss-description">Description</label>
                <textarea
                    id="rss-description"
                    className="textarea"
                    rows={8}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="rss-link">Link</label>
                <input
                    id="rss-link"
                    className="input"
                    type="text"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="rss-pubdate">Publish Date</label>
                <input
                    id="rss-pubdate"
                    className="input"
                    type="datetime-local"
                    value={pubDate}
                    onChange={e => setPubDate(e.target.value)}
                />
            </div>
            <div className="form-group flex items-center gap-2">
                <label className="checkbox-label" htmlFor="rss-published">Published</label>
                <input
                    id="rss-published"
                    className="checkbox-input"
                    type="checkbox"
                    checked={isPublished}
                    onChange={e => setIsPublished(e.target.checked)}
                />
            </div>
            {error && <div className="form-error mb-4">{error}</div>}
            <div className="flex gap-3 justify-end mt-6">
                <button
                    type="button"
                    className="btn btn-secondary btn-medium"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary btn-medium"
                    disabled={loading}
                >
                    Save
                </button>
            </div>
        </form>
    );
};

export default RssEntryForm;
