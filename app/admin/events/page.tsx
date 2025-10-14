"use client";
import CreateEventForm from "@/components/admin/CreateEventForm";
import Modal from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { Check, Plus } from 'lucide-react';

export default function EventsAdminPage() {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [verifiedFilter, setVerifiedFilter] = useState(false);
    const [sortKey, setSortKey] = useState("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        refreshEvents();
    }, []);

    async function refreshEvents() {
        setLoading(true);
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            setEvents(data.events || []);
        } catch {
            showToast("Failed to load events", "error");
        } finally {
            setLoading(false);
        }
    }

    // Sort events first
    const sorted = [...events].sort((a, b) => {
        if (sortKey === "date") {
            return sortDir === "asc"
                ? new Date(a.sortDate || 0).getTime() - new Date(b.sortDate || 0).getTime()
                : new Date(b.sortDate || 0).getTime() - new Date(a.sortDate || 0).getTime();
        }
        if (sortKey === "venue") {
            const aVenue = a.venue?.name?.toLowerCase() || "";
            const bVenue = b.venue?.name?.toLowerCase() || "";
            if (aVenue < bVenue) return sortDir === "asc" ? -1 : 1;
            if (aVenue > bVenue) return sortDir === "asc" ? 1 : -1;
            return 0;
        }
        if (sortKey === "band") {
            const aBand = a.primaryBand?.name?.toLowerCase() || "solo";
            const bBand = b.primaryBand?.name?.toLowerCase() || "solo";
            if (aBand < bBand) return sortDir === "asc" ? -1 : 1;
            if (aBand > bBand) return sortDir === "asc" ? 1 : -1;
            return 0;
        }
        return 0;
    });

    // Filter after sorting
    const filtered = sorted.filter(event => {
        const dateStr = formatEventDate(event);
        const venueFields = [event.venue?.name, event.venue?.context, event.venue?.city, event.venue?.stateProvince].filter(Boolean).join(", ");
        const matchesSearch =
            dateStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venueFields.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesVerified = verifiedFilter ? event.verified === true : true;
        return matchesSearch && matchesVerified;
    });

    return (
        <div className="page-container">
            <div className="page-header flex items-center gap-3">
                <h1 className="page-title">Events</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={() => setCreateModalOpen(true)}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Event">
                <CreateEventForm
                    onSuccess={(newEventId: number) => {
                        setCreateModalOpen(false);
                        router.push(`/admin/events/${newEventId}`);
                    }}
                    onCancel={() => setCreateModalOpen(false)}
                />
            </Modal>
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
                <input
                    type="text"
                    className="search-input w-full md:w-1/2"
                    placeholder="Search date or venue..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={verifiedFilter}
                        onChange={e => setVerifiedFilter(e.target.checked)}
                    />
                    Verified
                </label>
            </div>
            {loading ? (
                <div className="loading-state"><div className="spinner"></div>Loading events...</div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">No events found</div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => {
                                    if (sortKey === "date") setSortDir(sortDir === "asc" ? "desc" : "asc");
                                    setSortKey("date");
                                }}>
                                    Date {sortKey === "date" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th className="cursor-pointer" onClick={() => {
                                    if (sortKey === "venue") setSortDir(sortDir === "asc" ? "desc" : "asc");
                                    setSortKey("venue");
                                }}>
                                    Venue {sortKey === "venue" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th className="cursor-pointer" onClick={() => {
                                    if (sortKey === "band") setSortDir(sortDir === "asc" ? "desc" : "asc");
                                    setSortKey("band");
                                }}>
                                    Band {sortKey === "band" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                </th>
                                <th>Verified</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(event => {
                                const venueFields = [event.venue?.name, event.venue?.context, event.venue?.city, event.venue?.stateProvince].filter(Boolean).join(", ");
                                return (
                                    <tr
                                        key={event.id}
                                        onClick={() => router.push(`/admin/events/${event.id}`)}
                                        className="cursor-pointer hover:bg-gray-50"
                                    >
                                        <td>{formatEventDate(event)}</td>
                                        <td>{venueFields || "—"}</td>
                                        <td>{event.primaryBand?.name || "Solo"}</td>
                                        <td className="text-center w-24">
                                            {event.verified ? <Check className="w-4 h-4 text-green-600 inline" /> : ""}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
