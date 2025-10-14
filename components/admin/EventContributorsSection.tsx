"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";
import Modal from "@/components/ui/Modal";
import EventContributorForm from "@/components/admin/EventContributorForm";
import { Plus } from 'lucide-react';

interface EventContributorsSectionProps {
    eventId: number;
}

interface EventContributor {
    id: number;
    description: string | null;
    contributorId: number;
    contributor: {
        id: number;
        name: string;
    };
}

export default function EventContributorsSection({ eventId }: EventContributorsSectionProps) {
    const [eventContributors, setEventContributors] = useState<EventContributor[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingContributorId, setEditingContributorId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    const refreshContributors = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/contributors`);
            if (!res.ok) throw new Error("Failed to fetch contributors");
            const data = await res.json();
            setEventContributors(data.eventContributors || []);
        } catch (err) {
            showError("Error fetching contributors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshContributors();
    }, [eventId]);

    const handleEdit = (id: number) => {
        setEditingContributorId(id);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this contributor?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/contributors/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete contributor");
            showSuccess("Contributor deleted");
            refreshContributors();
        } catch (err) {
            showError("Error deleting contributor");
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingContributorId(null);
    };

    const handleFormSuccess = () => {
        handleModalClose();
        refreshContributors();
    };

    return (
        <section className="mt-6">
            <details open={eventContributors.length > 0}>
                <summary className="text-lg font-medium select-none cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Event Contributors ({eventContributors.length})</span>
                        <button
                            className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                            onClick={(e) => { e.preventDefault(); setEditingContributorId(null); setModalOpen(true); }}
                            type="button"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </summary>
                <div className="mt-2">
                    <div className="flex items-center mb-2">
                        <span className="font-semibold">Contributors and sources</span>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Name</th>
                                    <th className="w-1 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="loading-state">
                                            Loading contributors...
                                        </td>
                                    </tr>
                                ) : eventContributors.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="empty-state">
                                            No contributors added.
                                        </td>
                                    </tr>
                                ) : (
                                    eventContributors.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.description || "—"}</td>
                                            <td>{c.contributor?.name}</td>
                                            <td className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => handleEdit(c.id)}
                                                    disabled={loading}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-small"
                                                    onClick={() => handleDelete(c.id)}
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
            <Modal isOpen={modalOpen} onClose={handleModalClose} title={editingContributorId ? "Edit Contributor" : "Add Contributor"}>
                <EventContributorForm
                    eventId={eventId}
                    contributorId={editingContributorId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </section>
    );
}
