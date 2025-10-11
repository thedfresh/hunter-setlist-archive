"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import EventTypeForm from '@/components/admin/EventTypeForm';
import { useToast } from '@/lib/hooks/useToast';

export default function EventTypesPage() {
    const [eventTypes, setEventTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshEventTypes();
    }, []);

    async function refreshEventTypes() {
        setLoading(true);
        try {
            const res = await fetch('/api/event-types', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setEventTypes(data.eventTypes || []);
        } catch (error) {
            setEventTypes([]);
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
        if (!confirm('Are you sure you want to delete this event type?')) return;
        try {
            const res = await fetch(`/api/admin/event-types/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Event type deleted');
            await refreshEventTypes();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete event type');
        }
    }

    const sorted = [...eventTypes].sort((a, b) => {
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
                <h1 className="page-title">Event Types</h1>
                <button
                    className="btn btn-primary btn-medium"
                    onClick={openAddModal}
                >
                    <span>+</span>
                    <span>Add Event Type</span>
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{eventTypes.length}</span>
                    <span>Total Event Types</span>
                </div>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading event types...</div>
                </div>
            ) : eventTypes.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="sortable" onClick={() => handleSort('includeInStats')}>
                                    Include in Stats
                                </th>
                                <th className="sortable" onClick={() => handleSort('uses')}>
                                    Uses {sortKey === 'uses' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((eventType) => (
                                <tr key={eventType.id}>
                                    <td>{eventType.name}</td>
                                    <td>{eventType.includeInStats ? '✔️' : '❌'}</td>
                                    <td>{eventType._count?.events ?? 0}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => openEditModal(eventType.id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(eventType.id)}
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
                    <div className="empty-title">No event types found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Event Type' : 'Edit Event Type'}
            >
                <EventTypeForm
                    eventTypeId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Event type added' : 'Event type updated');
                        await refreshEventTypes();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
