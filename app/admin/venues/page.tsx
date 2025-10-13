"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import VenueForm from "@/components/admin/VenueForm";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/hooks/useToast";

function fetchVenues() {
    return fetch("/api/venues").then(res => res.json());
}

export default function VenuesAdminPage() {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editVenueId, setEditVenueId] = useState(0);
    const { showToast } = useToast();

    const refreshVenues = async () => {
        setLoading(true);
        try {
            const data = await fetchVenues();
            setVenues(data.venues || []);
        } catch {
            showToast("Failed to load venues", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshVenues();
    }, []);

    function openAddModal() {
        setEditVenueId(0);
        setModalOpen(true);
    }
    function handleEdit(id: number) {
        setEditVenueId(id);
        setModalOpen(true);
    }
    function handleSuccess() {
        setModalOpen(false);
        refreshVenues();
        showToast("Venue saved", "success");
    }
    function handleCancel() {
        setModalOpen(false);
    }
    async function handleDelete(id: number, eventCount: number) {
        if (eventCount > 0) {
            showToast(`Cannot delete - has ${eventCount} events`, "error");
            return;
        }
        if (!confirm("Are you sure you want to delete this venue?")) return;
        try {
            const res = await fetch(`/api/admin/venues/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Delete failed");
            showToast("Venue deleted", "success");
            refreshVenues();
        } catch (err: any) {
            showToast(err?.message || "Failed to delete venue", "error");
        }
    }

    return (
        <div className="page-container">
            <h1 className="text-2xl font-bold mb-6">Venues</h1>
            <div className="flex justify-end mb-4">
                <button className="btn btn-primary btn-medium" onClick={openAddModal}>Add Venue</button>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>City</th>
                            <th>State</th>
                            <th className="text-center">Uncertain</th>
                            <th className="text-center">Events</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="loading-state">Loading...</td></tr>
                        ) : venues.length === 0 ? (
                            <tr><td colSpan={6} className="empty-state">No venues found</td></tr>
                        ) : venues.map((venue: any) => (
                            <tr key={venue.id}>
                                <td>{venue.name}</td>
                                <td>{venue.city}</td>
                                <td>{venue.stateProvince}</td>
                                <td className="text-center">{venue.isUncertain ? "✔️" : "❌"}</td>
                                <td className="text-center">{venue._count?.events ?? 0}</td>
                                <td className="text-center flex gap-2 justify-center">
                                    <Link href={`/admin/venues/${venue.id}`}>
                                        <button className="btn btn-secondary btn-small">View/Edit</button>
                                    </Link>
                                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(venue.id, venue._count?.events ?? 0)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editVenueId === 0 ? 'Add Venue' : 'Edit Venue'}
            >
                <VenueForm
                    venueId={editVenueId || 0}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    );
}
