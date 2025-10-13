"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";
import Modal from "@/components/ui/Modal";
import EventContributorForm from "@/components/admin/EventContributorForm";

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
            showError("Error loading contributors");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshContributors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleAdd = () => {
        setEditingContributorId(null);
        setModalOpen(true);
    };

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
                <summary className="text-lg font-medium select-none cursor-pointer">
                    Event Contributors ({eventContributors.length})
                </summary>
                <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Contributors and sources</span>
                        <button
                            className="btn btn-primary btn-medium"
                            onClick={handleAdd}
                            disabled={loading}
                        >
                            Add Contributor
                        </button>
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
                                                    onClick={() => handleDelete(c.contributorId)}
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
