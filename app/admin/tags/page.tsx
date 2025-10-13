"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import TagForm from '@/components/admin/TagForm';
import { useToast } from '@/lib/hooks/useToast';
import { Plus } from 'lucide-react';

export default function TagsPage() {
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'name' | 'uses'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshTags();
    }, []);

    async function refreshTags() {
        setLoading(true);
        try {
            const res = await fetch('/api/tags', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setTags(data.tags || []);
        } catch (error) {
            setTags([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSort(key: 'name' | 'uses') {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    function openAddModal() {
        setEditingId(0);
        setModalOpen(true);
    }
    function openEditModal(id: number) {
        setEditingId(id);
        setModalOpen(true);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this tag?')) return;
        try {
            const res = await fetch(`/api/admin/tags/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Tag deleted');
            await refreshTags();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete tag');
        }
    }

    const sorted = [...tags].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'uses') {
            aVal = a._count?.songTags ?? 0;
            bVal = b._count?.songTags ?? 0;
        } else {
            aVal = a.name?.toLowerCase?.() ?? '';
            bVal = b.name?.toLowerCase?.() ?? '';
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    function truncate(text: string, max: number) {
        if (!text) return '';
        return text.length > max ? text.slice(0, max) + '…' : text;
    }

    return (
        <div>
            <div className="page-header flex items-center gap-3">
                <h1 className="page-title">Tags</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{tags.length}</span>
                    <span>Total Tags</span>
                </div>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading tags...</div>
                </div>
            ) : tags.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Description</th>
                                <th className="sortable" onClick={() => handleSort('uses')}>
                                    Uses {sortKey === 'uses' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((tag) => (
                                <tr key={tag.id}>
                                    <td>{tag.name}</td>
                                    <td>{truncate(tag.description, 60)}</td>
                                    <td>{tag._count?.songTags ?? 0}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => openEditModal(tag.id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
                                                className="btn btn-danger btn-small"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-title">No tags found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Tag' : 'Edit Tag'}
            >
                <TagForm
                    tagId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Tag added' : 'Tag updated');
                        await refreshTags();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
