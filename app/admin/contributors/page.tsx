"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ContributorForm from '@/components/admin/ContributorForm';
import { useToast } from '@/lib/hooks/useToast';
import { Plus, Trash2 } from 'lucide-react';

export default function ContributorsPage() {
    const [contributors, setContributors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'name' | 'contributions'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshContributors();
    }, []);

    async function refreshContributors() {
        setLoading(true);
        try {
            const res = await fetch('/api/contributors', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setContributors(data.contributors || []);
        } catch (error) {
            setContributors([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSort(key: 'name' | 'contributions') {
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
        if (!confirm('Are you sure you want to delete this contributor?')) return;
        try {
            const res = await fetch(`/api/admin/contributors/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Contributor deleted');
            await refreshContributors();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete contributor');
        }
    }

    const sorted = [...contributors].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'contributions') {
            aVal = (a._count?.eventContributors ?? 0) + (a._count?.recordings ?? 0);
            bVal = (b._count?.eventContributors ?? 0) + (b._count?.recordings ?? 0);
        } else {
            aVal = a.name?.toLowerCase?.() ?? '';
            bVal = b.name?.toLowerCase?.() ?? '';
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <div className="page-header flex items-center gap-3">
                <h1 className="page-title">Contributors</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading contributors...</div>
                </div>
            ) : contributors.length > 0 ? (
                <div className="table-container inline-block">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Email</th>
                                <th className="sortable" onClick={() => handleSort('contributions')}>
                                    Contributions {sortKey === 'contributions' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((contributor) => (
                                <tr
                                    key={contributor.id}
                                    onClick={() => openEditModal(contributor.id)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="w-12" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                                            onClick={() => handleDelete(contributor.id)}
                                            title="Delete contributor"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td>{contributor.name}</td>
                                    <td>{contributor.email || '—'}</td>
                                    <td>{contributor._count?.eventContributors ?? 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-title">No contributors found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Contributor' : 'Edit Contributor'}
            >
                <ContributorForm
                    contributorId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Contributor added' : 'Contributor updated');
                        await refreshContributors();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
