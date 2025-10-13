"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import MusicianForm from '@/components/admin/MusicianForm';
import { useToast } from '@/lib/hooks/useToast';
import { Plus, Trash2 } from 'lucide-react';

export default function MusiciansPage() {
    const [musicians, setMusicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'name' | 'appearances'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshMusicians();
    }, []);

    async function refreshMusicians() {
        setLoading(true);
        try {
            const res = await fetch('/api/musicians', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMusicians(data.musicians || []);
        } catch (error) {
            setMusicians([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSort(key: 'name' | 'appearances') {
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
        if (!confirm('Are you sure you want to delete this musician?')) return;
        try {
            const res = await fetch(`/api/admin/musicians/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Musician deleted');
            await refreshMusicians();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete musician');
        }
    }

    const sorted = [...musicians].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'appearances') {
            aVal = (a._count?.eventMusicians ?? 0) + (a._count?.performanceMusicians ?? 0) + (a._count?.bandMusicians ?? 0);
            bVal = (b._count?.eventMusicians ?? 0) + (b._count?.performanceMusicians ?? 0) + (b._count?.bandMusicians ?? 0);
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
                <h1 className="page-title">Musicians</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{musicians.length}</span>
                    <span>Total Musicians</span>
                </div>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading musicians...</div>
                </div>
            ) : musicians.length > 0 ? (
                <div className="table-container inline-block">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Uncertain</th>
                                <th className="sortable" onClick={() => handleSort('appearances')}>
                                    Appearances {sortKey === 'appearances' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((musician) => (
                                <tr
                                    key={musician.id}
                                    onClick={() => openEditModal(musician.id)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="w-12" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                                            onClick={() => handleDelete(musician.id)}
                                            title="Delete musician"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td>{musician.name}</td>
                                    <td>{musician.isUncertain ? '✔️' : '❌'}</td>
                                    <td>{(musician._count?.eventMusicians ?? 0) + (musician._count?.performanceMusicians ?? 0) + (musician._count?.bandMusicians ?? 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-title">No musicians found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Musician' : 'Edit Musician'}
            >
                <MusicianForm
                    musicianId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Musician added' : 'Musician updated');
                        await refreshMusicians();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
