"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import SongForm from "@/components/admin/SongForm";
import { useToast } from "@/lib/hooks/useToast";

function fetchSongs() {
    return fetch("/api/songs").then(res => res.json());
}

export default function SongsAdminPage() {
    // Use 'any' for now, or import Song type if available
    const [songs, setSongs] = useState<any[]>([]);
    const [sortKey, setSortKey] = useState('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(0);
    const { showToast } = useToast();

    const refreshSongs = async () => {
        setLoading(true);
        try {
            const data = await fetchSongs();
            setSongs(data.songs || []);
        } catch {
            showToast("Failed to load songs", "error");
        } finally {
            setLoading(false);
        }
    };

    // Sorting logic
    const sortedSongs = [...songs].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'title') {
            aVal = a.title?.toLowerCase() || '';
            bVal = b.title?.toLowerCase() || '';
        } else if (sortKey === 'performanceCount') {
            aVal = a.performanceCount ?? 0;
            bVal = b.performanceCount ?? 0;
        } else {
            aVal = a[sortKey] ?? '';
            bVal = b[sortKey] ?? '';
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    function handleSort(key: string) {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    }

    useEffect(() => {
        refreshSongs();
    }, []);

    function openAddModal() {
        setModalOpen(true);
    }
    function handleSuccess() {
        setModalOpen(false);
        refreshSongs();
        showToast("Song saved", "success");
    }
    function handleCancel() {
        setModalOpen(false);
    }
    async function handleDelete(id: number, usageCount: number) {
        if (usageCount > 0) {
            showToast(`Cannot delete - has ${usageCount} usages`, "error");
            return;
        }
        if (!confirm("Are you sure you want to delete this song?")) return;
        try {
            const res = await fetch(`/api/admin/songs/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Delete failed");
            showToast("Song deleted", "success");
            refreshSongs();
        } catch (err: any) {
            showToast(err?.message || "Failed to delete song", "error");
        }
    }

    return (
        <div className="page-container">
            <div className="page-header flex items-center justify-between">
                <h1 className="page-title">Songs</h1>
                <button className="btn btn-primary btn-medium" onClick={openAddModal}>
                    <span>+</span>
                    <span>Add Song</span>
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{songs.length}</span>
                    <span>Total Songs</span>
                </div>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading songs...</div>
                </div>
            ) : songs.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="cursor-pointer" onClick={() => handleSort('title')}>
                                    Title {sortKey === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th>Alternate Title</th>
                                <th className="cursor-pointer" onClick={() => handleSort('performanceCount')}>
                                    Performances {sortKey === 'performanceCount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th>Box of Rain</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSongs.map((song: any) => (
                                <tr key={song.id}>
                                    <td>{song.title}</td>
                                    <td>{song.alternateTitle ?? song.alternate_title ?? ''}</td>
                                    <td>{song.performanceCount ?? song._count?.performances ?? 0}</td>
                                    <td className="text-center">{song.inBoxOfRain ?? song.in_box_of_rain ? "✔️" : "❌"}</td>
                                    <td className="text-center flex gap-2 justify-center">
                                        <Link href={`/admin/songs/${song.id}`}>
                                            <button className="btn btn-secondary btn-small">View/Edit</button>
                                        </Link>
                                        <button className="btn btn-danger btn-small" onClick={() => handleDelete(song.id, (song._count?.performances ?? 0) + (song._count?.songAlbums ?? 0) + (song._count?.songTags ?? 0))}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">No songs found</div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={handleCancel}
                title="Add Song"
            >
                <SongForm songId={0} onSuccess={handleSuccess} onCancel={handleCancel} />
            </Modal>
        </div>
    );
}
