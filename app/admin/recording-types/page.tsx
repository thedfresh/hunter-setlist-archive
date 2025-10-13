"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import RecordingTypeForm from '@/components/admin/RecordingTypeForm';
import { useToast } from '@/lib/hooks/useToast';
import { Plus, Trash2 } from 'lucide-react';

export default function RecordingTypesPage() {
    const [recordingTypes, setRecordingTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'name' | 'uses'>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshRecordingTypes();
    }, []);

    async function refreshRecordingTypes() {
        setLoading(true);
        try {
            const res = await fetch('/api/recording-types', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setRecordingTypes(data.recordingTypes || []);
        } catch (error) {
            setRecordingTypes([]);
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
        if (!confirm('Are you sure you want to delete this recording type?')) return;
        try {
            const res = await fetch(`/api/admin/recording-types/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Recording type deleted');
            await refreshRecordingTypes();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete recording type');
        }
    }

    const sorted = [...recordingTypes].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'uses') {
            aVal = a._count?.recordings ?? 0;
            bVal = b._count?.recordings ?? 0;
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
                <h1 className="page-title">Recording Types</h1>
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
                    <div className="loading-text">Loading recording types...</div>
                </div>
            ) : recordingTypes.length > 0 ? (
                <div className="table-container inline-block">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Description</th>
                                <th className="sortable" onClick={() => handleSort('uses')}>
                                    Uses {sortKey === 'uses' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((recordingType) => (
                                <tr
                                    key={recordingType.id}
                                    onClick={() => openEditModal(recordingType.id)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="w-12" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                                            onClick={() => handleDelete(recordingType.id)}
                                            title="Delete recording type"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td>{recordingType.name}</td>
                                    <td>{recordingType.description || '—'}</td>
                                    <td>{recordingType._count?.recordings ?? 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-title">No recording types found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Recording Type' : 'Edit Recording Type'}
            >
                <RecordingTypeForm
                    recordingTypeId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Recording type added' : 'Recording type updated');
                        await refreshRecordingTypes();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
