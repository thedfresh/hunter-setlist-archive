"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import BandForm from '@/components/admin/BandForm';
import { useToast } from '@/lib/hooks/useToast';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

export default function BandsPage() {
    const [bands, setBands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'name' | 'members' | 'shows'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();
    const router = useRouter();

    useEffect(() => {
        refreshBands();
    }, []);

    async function refreshBands() {
        setLoading(true);
        try {
            const res = await fetch('/api/bands', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setBands(data.bands || []);
        } catch (error) {
            setBands([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSort(key: 'name' | 'members' | 'shows') {
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
        if (!confirm('Are you sure you want to delete this band?')) return;
        try {
            const res = await fetch(`/api/admin/bands/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Band deleted');
            await refreshBands();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete band');
        }
    }

    const sorted = [...bands].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'members') {
            aVal = a.bandMusicians?.length ?? 0;
            bVal = b.bandMusicians?.length ?? 0;
        } else if (sortKey === 'shows') {
            aVal = a._count?.events ?? 0;
            bVal = b._count?.events ?? 0;
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
                <h1 className="page-title">Bands</h1>
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
                    <div className="loading-text">Loading bands...</div>
                </div>
            ) : bands.length > 0 ? (
                <div className="table-container inline-block">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Members</th>
                                <th className="sortable" onClick={() => handleSort('shows')}>
                                    Shows {sortKey === 'shows' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((band) => (
                                <tr
                                    key={band.id}
                                    onClick={() => router.push(`/admin/bands/${band.id}`)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="w-12" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                                            onClick={() => handleDelete(band.id)}
                                            title="Delete band"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td>{band.name}</td>
                                    <td>{band._count?.bandMusicians ?? 0}</td>
                                    <td>{band._count?.events ?? 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-title">No bands found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Band' : 'Edit Band Info'}
            >
                <BandForm
                    bandId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Band added' : 'Band info updated');
                        await refreshBands();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
