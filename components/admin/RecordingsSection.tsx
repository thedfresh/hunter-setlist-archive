"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";
import Modal from "@/components/ui/Modal";
import RecordingForm from "@/components/admin/RecordingForm";
import { recordingLinkPatterns } from '@/lib/utils/recordingLinks';
import { ExternalLink } from 'lucide-react';
import { Plus } from 'lucide-react';

interface RecordingsSectionProps {
    eventId: number;
}

interface Recording {
    id: number;
    recordingType: { name: string } | null;
    description: string | null;
    taper: string | null;
    lmaIdentifier?: string | null;
    losslessLegsId?: string | null;
    youtubeVideoId?: string | null;
    shnId?: string | null;
    featured?: boolean;
    featuredText?: string | null;
}

export default function RecordingsSection({ eventId }: RecordingsSectionProps) {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [editingRecordingId, setEditingRecordingId] = useState<number | null>(null);
    const { showSuccess, showError } = useToast();

    const refreshRecordings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/recordings`);
            if (!res.ok) throw new Error("Failed to fetch recordings");
            const data = await res.json();
            setRecordings(data.recordings || []);
        } catch (err) {
            showError("Error loading recordings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshRecordings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleAdd = () => {
        setEditingRecordingId(null);
        setModalOpen(true);
    };

    const handleEdit = (id: number) => {
        setEditingRecordingId(id);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this recording?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/recordings/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete recording");
            showSuccess("Recording deleted");
            refreshRecordings();
        } catch (err) {
            showError("Error deleting recording");
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setEditingRecordingId(null);
    };

    const handleFormSuccess = () => {
        handleModalClose();
        refreshRecordings();
    };

    return (
        <section className="mb-8">
            <details open={recordings.length > 0}>
                <summary className="text-lg font-medium select-none cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Recordings ({recordings.length})</span>
                        <button
                            className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                            onClick={(e) => { e.preventDefault(); setEditingRecordingId(null); setModalOpen(true); }}
                            type="button"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </summary>
                <div className="mt-2">
                    <div className="flex items-center mb-2">
                        <span className="font-semibold">Available recordings</span>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Links</th>
                                    <th>Featured</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="loading-state">
                                            Loading recordings...
                                        </td>
                                    </tr>
                                ) : recordings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="empty-state">
                                            No recordings added.
                                        </td>
                                    </tr>
                                ) : (
                                    recordings.map((r) => {
                                        const links = [
                                            r.lmaIdentifier && 'LMA',
                                            r.losslessLegsId && 'LL',
                                            r.shnId && 'etree',
                                            r.youtubeVideoId && 'YT'
                                        ].filter(Boolean).join(', ');
                                        return (
                                            <tr key={r.id}>
                                                <td>{r.recordingType?.name || "—"}</td>
                                                <td>{r.description || "—"}</td>
                                                <td>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {r.lmaIdentifier && (
                                                            <a
                                                                href={recordingLinkPatterns.lma(r.lmaIdentifier)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                                                            >
                                                                LMA <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {r.losslessLegsId && (
                                                            <a
                                                                href={recordingLinkPatterns.ll(r.losslessLegsId)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                                                            >
                                                                LL <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {r.shnId && (
                                                            <a
                                                                href={recordingLinkPatterns.et(r.shnId)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                                                            >
                                                                etree <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {r.youtubeVideoId && (
                                                            <a
                                                                href={recordingLinkPatterns.yt(r.youtubeVideoId)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                                                            >
                                                                YT <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {!r.lmaIdentifier && !r.losslessLegsId && !r.shnId && !r.youtubeVideoId && "—"}
                                                    </div>
                                                </td>
                                                <td>
                                                    {r.featured && (
                                                        <span title={r.featuredText || ''}>
                                                            ★ {r.featuredText && r.featuredText.substring(0, 100)}
                                                            {r.featuredText && r.featuredText.length > 100 && '...'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="flex justify-end gap-2">
                                                    <button
                                                        className="btn btn-secondary btn-small"
                                                        onClick={() => handleEdit(r.id)}
                                                        disabled={loading}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-small"
                                                        onClick={() => handleDelete(r.id)}
                                                        disabled={loading}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </details>
            <Modal isOpen={modalOpen} onClose={handleModalClose} title={editingRecordingId ? "Edit Recording" : "Add Recording"}>
                <RecordingForm
                    eventId={eventId}
                    recordingId={editingRecordingId}
                    onSuccess={handleFormSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>
        </section>
    );
}
