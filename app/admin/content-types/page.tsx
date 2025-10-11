"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ContentTypeForm from '@/components/admin/ContentTypeForm';
import { useToast } from '@/lib/hooks/useToast';

export default function ContentTypesPage() {
    const [contentTypes, setContentTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshContentTypes();
    }, []);

    async function refreshContentTypes() {
        setLoading(true);
        try {
            const res = await fetch('/api/content-types', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setContentTypes(data.contentTypes || []);
        } catch (error) {
            setContentTypes([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSort(key: string) {
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
        if (!confirm('Are you sure you want to delete this content type?')) return;
        try {
            const res = await fetch(`/api/admin/content-types/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Content type deleted');
            await refreshContentTypes();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete content type');
        }
    }

    const sorted = [...contentTypes].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'uses') {
            aVal = a._count?.events ?? 0;
            bVal = b._count?.events ?? 0;
        } else {
            aVal = a[sortKey]?.toLowerCase?.() ?? '';
            bVal = b[sortKey]?.toLowerCase?.() ?? '';
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <div className="page-header flex items-center justify-between">
                <h1 className="page-title">Content Types</h1>
                <button
                    className="btn btn-primary btn-medium"
                    onClick={openAddModal}
                >
                    <span>+</span>
                    <span>Add Content Type</span>
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{contentTypes.length}</span>
                    <span>Total Content Types</span>
                </div>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading content types...</div>
                </div>
            ) : contentTypes.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="sortable" onClick={() => handleSort('uses')}>
                                    Uses {sortKey === 'uses' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((contentType) => (
                                <tr key={contentType.id}>
                                    <td>{contentType.name}</td>
                                    <td>{contentType._count?.events ?? 0}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => openEditModal(contentType.id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contentType.id)}
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
                    <div className="empty-title">No content types found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Content Type' : 'Edit Content Type'}
            >
                <ContentTypeForm
                    contentTypeId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Content type added' : 'Content type updated');
                        await refreshContentTypes();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
