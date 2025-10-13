"use client";
import { useState, useEffect } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import Modal from '@/components/ui/Modal';
import InstrumentForm from '@/components/admin/InstrumentForm';
import { Plus } from "lucide-react";

export default function InstrumentsPage() {
    const [instruments, setInstruments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const { showSuccess, showError } = useToast();

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);


    useEffect(() => {
        refreshInstruments();
    }, []);

    async function refreshInstruments() {
        setLoading(true);
        try {
            const res = await fetch('/api/instruments', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setInstruments(data.instruments || []);
        } catch (error) {
            setInstruments([]);
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
        if (!confirm('Are you sure you want to delete this instrument?')) return;
        try {
            const res = await fetch(`/api/admin/instruments/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            showSuccess('Instrument deleted');
            await refreshInstruments();
        } catch (error) {
            showError('Failed to delete instrument');
        }
    }

    const totalUses = instruments.reduce((sum, inst) => {
        const count = inst._count || { eventMusicians: 0, performanceMusicians: 0 };
        return sum + (count.eventMusicians ?? 0) + (count.performanceMusicians ?? 0);
    }, 0);

    const sorted = [...instruments].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'uses') {
            aVal = (a._count?.eventMusicians ?? 0) + (a._count?.performanceMusicians ?? 0);
            bVal = (b._count?.eventMusicians ?? 0) + (b._count?.performanceMusicians ?? 0);
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
            <div className="page-header flex items-center gap-3">
                <h1 className="page-title">Instruments</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            {/* Stats Summary */}
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{instruments.length}</span>
                    <span>Total Instruments</span>
                </div>
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{totalUses}</span>
                    <span>Total Uses</span>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading instruments...</div>
                </div>
            ) : instruments.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="sortable" onClick={() => handleSort('displayName')}>
                                    Display Name {sortKey === 'displayName' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="sortable" onClick={() => handleSort('uses')}>
                                    Uses {sortKey === 'uses' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((instrument) => {
                                const uses = instrument._count.eventMusicians + instrument._count.performanceMusicians;
                                return (
                                    <tr key={instrument.id}>
                                        <td>{instrument.name}</td>
                                        <td>{instrument.displayName}</td>
                                        <td>{uses}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => openEditModal(instrument.id)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(instrument.id)}
                                                    className="btn btn-danger btn-small"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-title">No instruments found</div>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Instrument' : 'Edit Instrument'}
            >
                <InstrumentForm
                    instrumentId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Instrument added' : 'Instrument updated');
                        await refreshInstruments();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
