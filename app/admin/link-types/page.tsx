"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import LinkTypeForm from '@/components/admin/LinkTypeForm';
import { useToast } from '@/lib/hooks/useToast';

export default function LinkTypesPage() {
    const [linkTypes, setLinkTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'name' | 'uses'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshLinkTypes();
    }, []);

    async function refreshLinkTypes() {
        setLoading(true);
        try {
            const res = await fetch('/api/link-types', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setLinkTypes(data.linkTypes || []);
        } catch (error) {
            setLinkTypes([]);
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
        if (!confirm('Are you sure you want to delete this link type?')) return;
        try {
            const res = await fetch(`/api/admin/link-types/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Link type deleted');
            await refreshLinkTypes();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete link type');
        }
    }

    const sorted = [...linkTypes].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'uses') {
            aVal = a._count?.links ?? 0;
            bVal = b._count?.links ?? 0;
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
            <div className="page-header flex items-center justify-between">
                <h1 className="page-title">Link Types</h1>
                <button
                    className="btn btn-primary btn-medium"
                    onClick={openAddModal}
                >
                    <span>+</span>
                    <span>Add Link Type</span>
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{linkTypes.length}</span>
                    <span>Total Link Types</span>
                </div>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading link types...</div>
                </div>
            ) : linkTypes.length > 0 ? (
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
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((lt) => (
                                <tr key={lt.id}>
                                    <td>{lt.name}</td>
                                    <td>{truncate(lt.description, 60)}</td>
                                    <td>{lt._count?.links ?? 0}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => openEditModal(lt.id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lt.id)}
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
                    <div className="empty-title">No link types found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Link Type' : 'Edit Link Type'}
            >
                <LinkTypeForm
                    linkTypeId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Link type added' : 'Link type updated');
                        await refreshLinkTypes();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
