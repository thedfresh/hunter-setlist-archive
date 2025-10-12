"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import AlbumForm from '@/components/admin/AlbumForm';
import { useToast } from '@/lib/hooks/useToast';

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'title' | 'artist' | 'year' | 'tracks'>('title');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    useEffect(() => {
        refreshAlbums();
    }, []);

    async function refreshAlbums() {
        setLoading(true);
        try {
            const res = await fetch('/api/albums', { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setAlbums(data.albums || []);
        } catch (error) {
            setAlbums([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSort(key: 'title' | 'artist' | 'year' | 'tracks') {
        if (sortKey === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    function openAddModal() {
        setEditingId(0);
        setModalOpen(true);
    }
    function openEditModal(id: number) {
        setEditingId(id);
        setModalOpen(true);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this album?')) return;
        try {
            const res = await fetch(`/api/admin/albums/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Delete failed');
            showSuccess('Album deleted');
            await refreshAlbums();
        } catch (error: any) {
            showError(error?.message || 'Failed to delete album');
        }
    }

    const sorted = [...albums].sort((a, b) => {
        let aVal, bVal;
        if (sortKey === 'tracks') {
            aVal = a._count?.songAlbums ?? 0;
            bVal = b._count?.songAlbums ?? 0;
        } else if (sortKey === 'year') {
            aVal = a.releaseYear ?? 0;
            bVal = b.releaseYear ?? 0;
        } else {
            aVal = a[sortKey]?.toLowerCase?.() ?? '';
            bVal = b[sortKey]?.toLowerCase?.() ?? '';
        }
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <div>
            <div className="page-header flex items-center justify-between">
                <h1 className="page-title">Albums</h1>
                <button
                    className="btn btn-primary btn-medium"
                    onClick={openAddModal}
                >
                    <span>+</span>
                    <span>Add Album</span>
                </button>
            </div>
            <div className="admin-stats">
                <div className="admin-stat-item">
                    <span className="admin-stat-value">{albums.length}</span>
                    <span>Total Albums</span>
                </div>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading albums...</div>
                </div>
            ) : albums.length > 0 ? (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="sortable" onClick={() => handleSort('title')}>
                                    Title {sortKey === 'title' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="sortable" onClick={() => handleSort('artist')}>
                                    Artist {sortKey === 'artist' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="sortable" onClick={() => handleSort('year')}>
                                    Year {sortKey === 'year' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th className="sortable" onClick={() => handleSort('tracks')}>
                                    Tracks {sortKey === 'tracks' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Official</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((album) => (
                                <tr key={album.id}>
                                    <td>{album.title}</td>
                                    <td>{album.artist}</td>
                                    <td>{album.releaseYear ?? ''}</td>
                                    <td>{album._count?.songAlbums ?? 0}</td>
                                    <td>{album.isOfficial ? '✔️' : '❌'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="btn btn-secondary btn-small"
                                                onClick={() => openEditModal(album.id)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(album.id)}
                                                className="btn btn-danger btn-small"
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
                    <div className="empty-title">No albums found</div>
                </div>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingId === 0 ? 'Add Album' : 'Edit Album'}
            >
                <AlbumForm
                    albumId={editingId || 0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess(editingId === 0 ? 'Album added' : 'Album updated');
                        await refreshAlbums();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
