"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";
import Modal from "@/components/ui/Modal";
import EventMusicianForm from "@/components/admin/EventMusicianForm";

interface EventMusiciansSectionProps {
    eventId: number;
}

export default function EventMusiciansSection({ eventId }: EventMusiciansSectionProps) {
    const { showToast } = useToast();
    const [eventMusicians, setEventMusicians] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMusicianId, setEditingMusicianId] = useState<number | null>(null);

    useEffect(() => {
        refreshMusicians();
        // eslint-disable-next-line
    }, [eventId]);

    async function refreshMusicians() {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/musicians`);
            const data = await res.json();
            setEventMusicians(data.eventMusicians || []);
        } catch {
            showToast("Failed to load event musicians", "error");
        } finally {
            setLoading(false);
        }
    }

    function handleAdd() {
        setEditingMusicianId(null);
        setModalOpen(true);
    }

    function handleEdit(musicianId: number) {
        setEditingMusicianId(musicianId);
        setModalOpen(true);
    }

    async function handleDelete(musicianId: number) {
        if (!window.confirm("Are you sure you want to remove this musician from the event?")) return;
        try {
            const res = await fetch(`/api/admin/events/${eventId}/musicians/${musicianId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            showToast("Event musician removed", "success");
            refreshMusicians();
        } catch {
            showToast("Failed to delete event musician", "error");
        }
    }

    function handleModalSuccess() {
        setModalOpen(false);
        showToast("Event musician saved", "success");
        refreshMusicians();
    }

    function handleModalCancel() {
        setModalOpen(false);
    }

    return (
        <section className="mt-6">
            <details open={eventMusicians.length > 0}>
                <summary className="cursor-pointer user-select-none font-medium text-lg mb-4">
                    Event Musicians ({eventMusicians.length})
                </summary>

                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">Show-level guest musicians</p>
                    <button className="btn btn-primary btn-medium" onClick={handleAdd}>Add Musician</button>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Musician</th>
                                <th>Instrument</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={3}>Loading musicians...</td></tr>
                            ) : eventMusicians.length === 0 ? (
                                <tr><td colSpan={3}>No event musicians added yet</td></tr>
                            ) : (
                                eventMusicians.map((em) => (
                                    <tr key={em.id}>
                                        <td>{em.musician?.name || "—"}</td>
                                        <td>{em.instrument?.displayName || "—"}</td>
                                        <td>
                                            <div className="flex gap-2 justify-end">
                                                <button className="btn btn-secondary btn-small" onClick={() => handleEdit(em.musicianId)}>Edit</button>
                                                <button className="btn btn-danger btn-small" onClick={() => handleDelete(em.musicianId)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </details>
            <Modal isOpen={modalOpen} onClose={handleModalCancel} title={editingMusicianId ? "Edit Event Musician" : "Add Event Musician"}>
                {
                    <EventMusicianForm
                        eventId={eventId}
                        musicianId={editingMusicianId}
                        onSuccess={handleModalSuccess}
                        onCancel={handleModalCancel}
                    />
                }
            </Modal>
        </section>
    );
}
