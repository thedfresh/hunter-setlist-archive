"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import VenueForm from "@/components/admin/VenueForm";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/hooks/useToast";
import { Plus } from "lucide-react";

export default function VenuesAdminPage() {
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editVenueId, setEditVenueId] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const { showToast } = useToast();

    useEffect(() => {
        refreshVenues();
    }, []);

    async function refreshVenues() {
        setLoading(true);
        try {
            const res = await fetch("/api/venues", { cache: 'no-store' });
            const data = await res.json();
            setVenues(data.venues || []);
        } catch {
            showToast("Failed to load venues", "error");
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditVenueId(0);
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

    function handleSort(key: string) {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    }

    const filtered = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venue.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venue.stateProvince || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'events') {
            aVal = a._count?.events ?? 0;
            bVal = b._count?.events ?? 0;
        } else {
            aVal = a[sortKey]?.toLowerCase() || '';
            bVal = b[sortKey]?.toLowerCase() || '';
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <div className="page-header flex items-center gap-3">
                <h1 className="page-title">Venus</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{venues.length}</span>
                    <span>Total Venues</span>
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search venues by name, city, or state..."
                    className="input"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading venues...</div>
                </div>
            ) : sorted.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('name')}>
                                    Name {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="sortable" onClick={() => handleSort('city')}>
                                    City {sortKey === 'city' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="sortable" onClick={() => handleSort('stateProvince')}>
                                    State {sortKey === 'stateProvince' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="text-center">Uncertain</th>
                                <th className="sortable text-center" onClick={() => handleSort('events')}>
                                    Events {sortKey === 'events' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((venue: any) => (
                                <tr key={venue.id}>
                                    <td>{venue.name}</td>
                                    <td>{venue.city}</td>
                                    <td>{venue.stateProvince}</td>
                                    <td className="text-center">{venue.isUncertain ? "✔️" : "❌"}</td>
                                    <td className="text-center">{venue._count?.events ?? 0}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Link href={`/admin/venues/${venue.id}`}>
                                                <button className="btn btn-secondary btn-small">View/Edit</button>
                                            </Link>
                                            <button
                                                className="btn btn-danger btn-small"
                                                onClick={() => handleDelete(venue.id, venue._count?.events ?? 0)}
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
                    <div className="empty-title">No venues found</div>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Add Venue"
            >
                <VenueForm
                    venueId={0}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    );
}