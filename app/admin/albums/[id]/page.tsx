"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { useToast } from "@/lib/hooks/useToast";
import { generateSlugFromName } from "@/lib/utils/generateSlug";
import Modal from "@/components/ui/Modal";
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function AlbumDetailPage({ params }: { params: { id: string } }) {
    const albumId = params.id;
    const router = useRouter();
    const toast = useToast();
    const [album, setAlbum] = useState<any>(null);
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [songs, setSongs] = useState<any[]>([]);
    const [newTrackSongId, setNewTrackSongId] = useState("");
    const [saving, setSaving] = useState(false);
    const { showSuccess, showError } = useToast();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    useEffect(() => {
        async function fetchAlbum() {
            setLoading(true);
            const res = await fetch(`/api/albums/${albumId}`);
            const data = await res.json();
            setAlbum(data.album || data);
            setLoading(false);
            setInitialLoadComplete(true);
        }
        async function fetchTracks() {
            const res = await fetch(`/api/admin/albums/${albumId}/tracks`);
            const data = await res.json();
            setTracks(data.tracks || []);
        }
        async function fetchSongs() {
            const res = await fetch(`/api/songs`);
            const data = await res.json();
            setSongs(data.songs || []);
        }
        fetchAlbum();
        fetchTracks();
        fetchSongs();
    }, [albumId]);

    function handleFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        setAlbum({
            ...album,
            [target.name]: target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
        });
        if (e.target.name === 'title' && initialLoadComplete) {
            setAlbum((prev: any) => ({ ...prev, slug: generateSlugFromName(e.target.value) }));
        }
    }

    async function handleSave() {
        setSaving(true);
        const res = await fetch(`/api/admin/albums/${albumId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(album)
        });
        if (res.ok) {
            toast.showSuccess('Album updated');
            router.refresh();
        } else {
            toast.showError('Failed to update album');
        }
        setSaving(false);
    }

    function handleOpenAddModal() {
        setShowAddModal(true);
        setNewTrackSongId("");
    }

    async function handleAddTrack() {
        if (!newTrackSongId) return;
        const res = await fetch(`/api/admin/albums/${albumId}/tracks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songId: newTrackSongId })
        });
        if (res.ok) {
            showSuccess('Track added');
            setShowAddModal(false);
            setNewTrackSongId("");
            await refreshTracks();
        } else {
            showError('Failed to add track');
        }
    }

    async function handleDeleteTrack(trackId: number) {
        const res = await fetch(`/api/admin/albums/${albumId}/tracks/${trackId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            toast.showSuccess('Track deleted');
            await refreshTracks();
        } else {
            toast.showError('Failed to delete track');
        }
    }

    async function refreshTracks() {
        const res = await fetch(`/api/admin/albums/${albumId}/tracks`);
        const data = await res.json();
        setTracks(data.tracks || []);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = tracks.findIndex(t => t.id === active.id);
            const newIndex = tracks.findIndex(t => t.id === over?.id);
            const newOrder = arrayMove(tracks, oldIndex, newIndex);
            setTracks(newOrder);
            // Send new order to API
            fetch(`/api/admin/albums/${albumId}/tracks/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackIds: newOrder.map(t => t.id) })
            }).then(res => {
                if (res.ok) toast.showSuccess('Tracks reordered');
                else toast.showError('Failed to reorder tracks');
                refreshTracks();
            });
        }
    }

    if (loading || !album) return <div className="loading-state">Loading...</div>;

    return (
        <div className="admin-detail-page">
            <Breadcrumbs items={[{ label: 'Albums', href: '/admin/albums' }, { label: album.title }]} />
            <h1 className="mb-4">Edit Album</h1>
            <form className="mb-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                        <label className="form-label">Title *</label>
                        <input className="input" name="title" value={album.title || ""} onChange={handleFieldChange} required />
                    </div>
                    <div>
                        <label className="form-label">Artist</label>
                        <input className="input" name="artist" value={album.artist || ""} onChange={handleFieldChange} />
                    </div>
                    <div>
                        <label className="form-label">Slug</label>
                        <input
                            className="input"
                            name="slug"
                            value={album.slug || ""}
                            onChange={handleFieldChange}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                    <div>
                        <label className="form-label">Release Year</label>
                        <input className="input" type="number" name="releaseYear" value={album.releaseYear || ""} onChange={handleFieldChange} />
                    </div>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            className="checkbox-input"
                            name="isOfficial"
                            checked={!!album.isOfficial}
                            onChange={handleFieldChange}
                        />
                        Official Release
                    </label>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                        <label className="form-label">Public Notes</label>
                        <textarea className="textarea" name="publicNotes" value={album.publicNotes || ""} onChange={handleFieldChange} rows={2} />
                    </div>
                    <div>
                        <label className="form-label">Private Notes</label>
                        <textarea className="textarea" name="privateNotes" value={album.privateNotes || ""} onChange={handleFieldChange} rows={2} />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary btn-small" disabled={saving}>Save</button>
                </div>
            </form>
            <hr className="my-8" />
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="section-header">Tracks ({tracks.length})</h2>
                    <button
                        className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                        onClick={handleOpenAddModal}
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
                {tracks && tracks.length > 0 ? (
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={tracks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {tracks.map(track => (
                                    <SortableTrack key={track.id} track={track} onDelete={handleDeleteTrack} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="text-gray-400">No tracks yet.</div>
                )}
            </div>

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Track">
                <form onSubmit={(e) => { e.preventDefault(); handleAddTrack(); }} className="space-y-4">
                    <div>
                        <label className="form-label form-label-required">Song</label>
                        <select
                            className="select"
                            value={newTrackSongId}
                            onChange={e => setNewTrackSongId(e.target.value)}
                            autoFocus
                            required
                        >
                            <option value="">Select song...</option>
                            {songs.map(song => (
                                <option key={song.id} value={song.id}>{song.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end mt-6">
                        <button type="button" className="btn btn-secondary btn-medium" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-medium" disabled={!newTrackSongId}>
                            Add Track
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function SortableTrack({ track, onDelete }: { track: any, onDelete: (id: number) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: track.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? '#f3f4f6' : undefined,
        border: isDragging ? '1px solid #d1d5db' : undefined
    };
    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 rounded border bg-white">
            <span {...attributes} {...listeners} className="cursor-grab"><GripVertical className="w-3 h-3" /></span>
            <span className="w-8 text-center font-mono text-xs">{track.trackNumber}</span>
            <span className="flex-1">{track.song?.title || track.songTitle}</span>
            <button
                className="btn btn-secondary btn-small !bg-red-50 !text-red-600 hover:!bg-red-100"
                onClick={() => onDelete(track.id)}
                title="Remove track"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
