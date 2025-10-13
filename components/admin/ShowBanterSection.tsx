
"use client";
import { Plus } from 'lucide-react';

import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";
import Modal from "@/components/ui/Modal";
import ShowBanterForm from "@/components/admin/ShowBanterForm";

interface ShowBanterSectionProps {
    eventId: number;
}

interface ShowBanter {
    id: number;
    banterText: string;
    isBeforeSong: boolean;
    performance: {
        song: { title: string };
    };
}

export default function ShowBanterSection({ eventId }: ShowBanterSectionProps) {
    const [showBanter, setShowBanter] = useState<ShowBanter[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingBanterId, setEditingBanterId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    const refreshBanter = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/banter`);
            if (!res.ok) throw new Error("Failed to fetch show banter");
            const data = await res.json();
            setShowBanter(data.showBanter || []);
        } catch (err) {
            showError("Error loading show banter");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshBanter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleAdd = () => {
        setEditingBanterId(null);
        setModalOpen(true);
    };

    const handleEdit = (id: number) => {
        setEditingBanterId(id);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this banter?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/banter/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete banter");
            showSuccess("Show banter deleted");
            refreshBanter();
        } catch (err) {
            showError("Error deleting show banter");
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingBanterId(null);
    };

    const handleFormSuccess = () => {
        handleModalClose();
        refreshBanter();
    };

    return (
        <section className="mb-8">
            <details open={showBanter.length > 0}>
                <summary className="text-lg font-medium select-none cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Show Banter ({showBanter.length})</span>
                        <button
                            className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                            onClick={(e) => { e.preventDefault(); setEditingBanterId(null); setModalOpen(true); }}
                            type="button"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </summary>
                <div className="mt-2">
                    <div className="flex items-center mb-2">
                        <span className="font-semibold">Stage talk and stories</span>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Preview</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="loading-state">
                                            Loading banter...
                                        </td>
                                    </tr>
                                ) : showBanter.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="empty-state">
                                            No banter added.
                                        </td>
                                    </tr>
                                ) : (
                                    showBanter.map((b) => (
                                        <tr key={b.id}>
                                            <td>
                                                {b.isBeforeSong ? `Before ${b.performance.song.title}` : `After ${b.performance.song.title}`}
                                            </td>
                                            <td>
                                                {b.banterText.length > 5000
                                                    ? b.banterText.substring(0, 5000) + "..."
                                                    : b.banterText}
                                            </td>
                                            <td className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => handleEdit(b.id)}
                                                    disabled={loading}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-small"
                                                    onClick={() => handleDelete(b.id)}
                                                    disabled={loading}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </details>
            <Modal isOpen={modalOpen} onClose={handleModalClose} title={editingBanterId ? "Edit Banter" : "Add Banter"}>
                <ShowBanterForm
                    eventId={eventId}
                    banterId={editingBanterId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </section>
    );
}
