"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import AlbumForm from '@/components/admin/AlbumForm';
import { useToast } from '@/lib/hooks/useToast';
import { Plus, Trash2 } from 'lucide-react';

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState<'title' | 'artist' | 'year' | 'tracks'>('title');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [modalOpen, setModalOpen] = useState(false);
    const router = useRouter();
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
            <div className="page-header flex items-center gap-3">
                <h1 className="page-title">Albums</h1>
                <button
                    className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                    onClick={openAddModal}
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading albums...</div>
                </div>
            ) : albums.length > 0 ? (
                <div className="table-container inline-block">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="w-12"></th>
                                <th className="sortable" onClick={() => handleSort('title')}>
                                    Title {sortKey === 'title' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Artist</th>
                                <th className="sortable" onClick={() => handleSort('year')}>
                                    Year {sortKey === 'year' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                                <th>Official</th>
                                <th className="sortable" onClick={() => handleSort('tracks')}>
                                    Tracks {sortKey === 'tracks' && (sortDir === 'asc' ? '▲' : '▼')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((album) => (
                                <tr
                                    key={album.id}
                                    onClick={() => router.push(`/admin/albums/${album.id}`)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="w-12" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                                            onClick={() => handleDelete(album.id)}
                                            title="Delete album"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td>{album.title}</td>
                                    <td>{album.artist || '—'}</td>
                                    <td>{album.releaseYear || '—'}</td>
                                    <td>{album.isOfficial ? '✔️' : '❌'}</td>
                                    <td>{album._count?.songAlbums ?? 0}</td>
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
                title="Add Album"
            >
                <AlbumForm
                    albumId={0}
                    onSuccess={async () => {
                        setModalOpen(false);
                        showSuccess('Album added');
                        await refreshAlbums();
                    }}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
