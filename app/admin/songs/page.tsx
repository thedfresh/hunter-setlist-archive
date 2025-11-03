"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import SongForm from "@/components/admin/SongForm";
import { useToast } from "@/lib/hooks/useToast";
import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SongsAdminPage() {
    const router = useRouter();
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
        (song.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'title') {
            aVal = a.title?.toLowerCase() || '';
            bVal = b.title?.toLowerCase() || '';
        } else if (sortKey === 'performanceCount') {
            aVal = a.performanceCount ?? 0;
            bVal = b.performanceCount ?? 0;
        } else if (["songBy", "writtenBy", "lyricsBy", "slug"].includes(sortKey)) {
            aVal = a[sortKey]?.toLowerCase?.() || '';
            bVal = b[sortKey]?.toLowerCase?.() || '';
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
            <div className="page-header flex items-center gap-3">
                <h1 className="page-title">Songs</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
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
                <div className="table-container inline-block">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th className="sortable" onClick={() => handleSort('title')}>
                                    Title {sortKey === 'title' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="sortable" onClick={() => handleSort('slug')}>
                                    Slug {sortKey === 'slug' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="sortable" onClick={() => handleSort('songBy')}>
                                    SongBy {sortKey === 'songBy' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="sortable" onClick={() => handleSort('writtenBy')}>
                                    WrittenBy {sortKey === 'writtenBy' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="sortable" onClick={() => handleSort('lyricsBy')}>
                                    LyricsBy {sortKey === 'lyricsBy' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th className="sortable" onClick={() => handleSort('performanceCount')}>
                                    Performances {sortKey === 'performanceCount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((song: any) => (
                                <tr
                                    key={song.id}
                                    onClick={() => router.push(`/admin/songs/${song.id}`)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="w-12" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                                            onClick={() => handleDelete(song.id, song.performanceCount ?? 0)}
                                            title="Delete song"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td>{song.title}</td>
                                    <td>{song.slug}</td>
                                    <td>{song.songBy}</td>
                                    <td>{song.writtenBy}</td>
                                    <td>{song.lyricsBy}</td>
                                    <td>{song.performanceCount ?? 0}</td>
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