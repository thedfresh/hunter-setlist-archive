"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import SongForm from "@/components/admin/SongForm";
import { useToast } from "@/lib/hooks/useToast";

export default function SongsAdminPage() {
    const [songs, setSongs] = useState<any[]>([]);
    const [sortKey, setSortKey] = useState('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        refreshSongs();
    }, []);

    async function refreshSongs() {
        setLoading(true);
        try {
            const res = await fetch("/api/songs", { cache: 'no-store' });
            const data = await res.json();
            setSongs(data.songs || []);
        } catch {
            showToast("Failed to load songs", "error");
        } finally {
            setLoading(false);
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

    const filtered = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.alternateTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
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
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search songs by title or alternate title..."
                    className="input"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading songs...</div>
                </div>
            ) : sorted.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('title')}>
                                    Title {sortKey === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th>Alternate Title</th>
                                <th className="sortable" onClick={() => handleSort('performanceCount')}>
                                    Performances {sortKey === 'performanceCount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th>Box of Rain</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((song: any) => (
                                <tr key={song.id}>
                                    <td>{song.title}</td>
                                    <td>{song.alternateTitle || ''}</td>
                                    <td>{song.performanceCount ?? 0}</td>
                                    <td className="text-center">{song.inBoxOfRain ? "✔️" : "❌"}</td>
                                    <td>
                                        <div className="table-actions">
                                            <Link href={`/admin/songs/${song.id}`}>
                                                <button className="btn btn-secondary btn-small">View/Edit</button>
                                            </Link>
                                            <button
                                                className="btn btn-danger btn-small"
                                                onClick={() => handleDelete(song.id, song.performanceCount ?? 0)}
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
                    <div className="empty-title">No songs found</div>
                </div>
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