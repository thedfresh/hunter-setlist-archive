"use client";
import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import RssEntryForm from '@/components/admin/RssEntryForm';
import Modal from '@/components/ui/Modal';
import { useToastContext } from '@/components/ui/ToastProvider';
import { formatEventDate } from '@/lib/formatters/dateFormatter';

interface RssEntry {
    id: number;
    title: string;
    description: string;
    link?: string;
    pubDate: string;
    isPublished: boolean;
}

const AdminRssEntriesPage: React.FC = () => {
    const [rssEntries, setRssEntries] = useState<RssEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(0);
    const { showSuccess, showError } = useToastContext();

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/rss-entries');
            const data = await res.json();
            setRssEntries(data.rssEntries || []);
        } catch {
            showError('Failed to load RSS entries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const openAddModal = () => {
        setEditingId(0);
        setModalOpen(true);
    };

    const handleEdit = (id: number) => {
        setEditingId(id);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this RSS entry?')) return;
        try {
            const res = await fetch(`/api/admin/rss-entries/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                showError(data.error || 'Failed to delete entry');
            } else {
                showSuccess('RSS entry deleted');
                fetchEntries();
            }
        } catch {
            showError('Failed to delete entry');
        }
    };

    const handleSuccess = () => {
        setModalOpen(false);
        fetchEntries();
        showSuccess('RSS entry saved');
    };

    const handleCancel = () => {
        setModalOpen(false);
    };

    return (
        <div>
            <div className="page-header flex items-center gap-3 mb-6">
                <h1 className="page-title">RSS Entries</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <div className="card">
                {loading ? (
                    <div className="loading-state">Loading...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Published</th>
                                <th>Pub Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rssEntries.map(entry => (
                                <tr key={entry.id} onClick={() => handleEdit(entry.id)} className="cursor-pointer hover:bg-gray-50">
                                    <td onClick={(e) => e.stopPropagation()} className="w-12">
                                        <button
                                            className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                                            onClick={() => handleDelete(entry.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td>
                                        {entry.title}

                                    </td>
                                    <td className="text-sm text-gray-600 max-w-md truncate">{entry.description}</td>
                                    <td>{entry.isPublished ? '✓' : '—'}</td>
                                    <td>{new Date(entry.pubDate).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <Modal
                isOpen={modalOpen}
                onClose={handleCancel}
                title={editingId === 0 ? 'Add RSS Entry' : 'Edit RSS Entry'}
            >
                <RssEntryForm
                    entryId={editingId}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    );
};

export default AdminRssEntriesPage;
