import { useState, useEffect, useRef } from "react";
import { useToast } from "@/lib/hooks/useToast";
import Modal from "@/components/ui/Modal";
import SetForm from "@/components/admin/SetForm";
import PerformanceEditor from "@/components/admin/PerformanceEditor";
import { Edit2, Trash2, GripVertical, Plus } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SetMusicianForm from "@/components/admin/SetMusicianForm";

interface SetsSectionProps {
    eventId: number;
}

function renderPerformanceDisplay(perf: any) {
    const parts = [];
    parts.push(`${perf.performanceOrder}.`);
    if (perf.isTruncatedStart) parts.push('//');
    parts.push(perf.song?.title || "Unknown Song");
    if (perf.seguesInto) parts.push('>');
    if (perf.isTruncatedEnd) parts.push('//');
    if (perf.publicNotes) parts.push('*');
    return parts.join(' ');
}

export default function SetsSection({ eventId }: SetsSectionProps) {
    const [sets, setSets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [setModalOpen, setSetModalOpen] = useState(false);
    const [editingSetId, setEditingSetId] = useState<number | null>(null);
    const [perfModalOpen, setPerfModalOpen] = useState(false);
    const [editingPerformance, setEditingPerformance] = useState<{ setId: number; perfId: number | null } | null>(null);
    const [activeSetIdForFocus, setActiveSetIdForFocus] = useState<number | null>(null);
    const addPerfButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
    const { showSuccess, showError } = useToast();

    const refreshSets = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/sets`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setSets(data.sets || []);
        } catch {
            showError("Failed to load sets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleAddSet = () => {
        setEditingSetId(null);
        setSetModalOpen(true);
    };

    const handleEditSet = (setId: number) => {
        setEditingSetId(setId);
        setSetModalOpen(true);
    };

    const handleDeleteSet = async (setId: number) => {
        if (!window.confirm("Delete this set and all its performances?")) return;
        try {
            const res = await fetch(`/api/admin/events/${eventId}/sets/${setId}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            showSuccess("Set deleted");
            refreshSets();
        } catch {
            showError("Error deleting set");
        }
    };

    const handleAddPerformance = (setId: number) => {
        setActiveSetIdForFocus(setId);
        setEditingPerformance({ setId, perfId: null });
        setPerfModalOpen(true);
    };

    const handleEditPerformance = (setId: number, perfId: number) => {
        setEditingPerformance({ setId, perfId });
        setPerfModalOpen(true);
    };

    const handleDeletePerformance = async (setId: number, perfId: number) => {
        if (!window.confirm("Delete this performance?")) return;
        try {
            const res = await fetch(`/api/admin/events/${eventId}/sets/${setId}/performances/${perfId}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            showSuccess("Performance deleted");
            refreshSets();
        } catch {
            showError("Error deleting performance");
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const sourceSet = sets.find(s => s.performances?.some((p: any) => p.id === active.id));
        if (!sourceSet) return;

        const targetSet = sets.find(s => s.performances?.some((p: any) => p.id === over.id));
        if (!targetSet) return;

        const sourcePerfs = sourceSet.performances || [];
        const oldIndex = sourcePerfs.findIndex((p: any) => p.id === active.id);

        if (sourceSet.id === targetSet.id) {
            const newIndex = sourcePerfs.findIndex((p: any) => p.id === over.id);
            const reordered = arrayMove(sourcePerfs, oldIndex, newIndex);

            try {
                const performanceIds = reordered.map((p: any) => p.id);
                const res = await fetch(`/api/admin/events/${eventId}/sets/${sourceSet.id}/performances/reorder`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ performanceIds })
                });
                if (!res.ok) throw new Error();
                await refreshSets();
            } catch {
                showError('Failed to reorder');
                await refreshSets();
            }
        } else {
            const targetPerfs = targetSet.performances || [];
            const targetIndex = targetPerfs.findIndex((p: any) => p.id === over.id);

            try {
                const res = await fetch(`/api/admin/events/${eventId}/sets/${sourceSet.id}/performances/move`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        performanceId: active.id,
                        targetSetId: targetSet.id,
                        targetPosition: targetIndex + 1
                    })
                });
                if (!res.ok) throw new Error();
                showSuccess('Performance moved');
                await refreshSets();
            } catch {
                showError('Failed to move performance');
                await refreshSets();
            }
        }
    };

    const allPerformanceIds = sets.flatMap(s => (s.performances || []).map((p: any) => p.id));

    return (
        <section className="mb-8">
            <details open={sets.length > 0}>
                <summary className="text-lg font-medium select-none cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Sets & Performances ({sets.length})</span>
                        <button
                            className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                            onClick={(e) => { e.preventDefault(); handleAddSet(); }}
                            type="button"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </summary>
                {loading ? (
                    <div className="mt-4">Loading sets...</div>
                ) : sets.length === 0 ? (
                    <div className="mt-4 text-gray-500">No sets yet. Add a set to begin.</div>
                ) : (
                    <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={allPerformanceIds} strategy={verticalListSortingStrategy}>
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {sets.map(set => (
                                    <SetCard
                                        key={set.id}
                                        set={set}
                                        eventId={eventId}
                                        addPerfButtonRef={(el) => {
                                            if (el) {
                                                addPerfButtonRefs.current.set(set.id, el);
                                            } else {
                                                addPerfButtonRefs.current.delete(set.id);
                                            }
                                        }}
                                        onEditSet={handleEditSet}
                                        onDeleteSet={handleDeleteSet}
                                        onAddPerformance={handleAddPerformance}
                                        onEditPerformance={handleEditPerformance}
                                        onDeletePerformance={handleDeletePerformance}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </details>
            <Modal isOpen={setModalOpen} onClose={() => setSetModalOpen(false)} title={editingSetId ? "Edit Set" : "Add Set"}>
                {setModalOpen && (
                    <SetForm
                        eventId={eventId}
                        setId={editingSetId}
                        onSuccess={() => {
                            setSetModalOpen(false);
                            showSuccess(editingSetId ? "Set updated" : "Set added");
                            refreshSets();
                        }}
                        onCancel={() => setSetModalOpen(false)}
                    />
                )}
            </Modal>
            <Modal isOpen={perfModalOpen} onClose={() => setPerfModalOpen(false)} title={editingPerformance?.perfId ? "Edit Performance" : "Add Performance"}>
                {perfModalOpen && editingPerformance && (
                    <PerformanceEditor
                        eventId={eventId}
                        setId={editingPerformance.setId}
                        performanceId={editingPerformance.perfId}
                        onSuccess={async () => {
                            setPerfModalOpen(false);
                            showSuccess(editingPerformance.perfId ? "Performance updated" : "Performance added");
                            await refreshSets();

                            // Focus the Add Performance button after adding (not editing)
                            if (!editingPerformance.perfId && activeSetIdForFocus) {
                                setTimeout(() => {
                                    const button = addPerfButtonRefs.current.get(activeSetIdForFocus);
                                    button?.focus();
                                }, 100);
                            }
                            setActiveSetIdForFocus(null);
                        }}
                        onCancel={() => setPerfModalOpen(false)}
                    />
                )}
            </Modal>
        </section>
    );
}

function SetCard({
    set,
    eventId,
    addPerfButtonRef,
    onEditSet,
    onDeleteSet,
    onAddPerformance,
    onEditPerformance,
    onDeletePerformance
}: {
    set: any;
    eventId: number;
    addPerfButtonRef?: (el: HTMLButtonElement | null) => void;
    onEditSet: (setId: number) => void;
    onDeleteSet: (setId: number) => void;
    onAddPerformance: (setId: number) => void;
    onEditPerformance: (setId: number, perfId: number) => void;
    onDeletePerformance: (setId: number, perfId: number) => void;
}) {
    const { showSuccess, showError } = useToast();
    const [setMusicians, setSetMusicians] = useState<any[]>([]);
    const [musiciansLoading, setMusiciansLoading] = useState(false);
    const [musicianModalOpen, setMusicianModalOpen] = useState(false);
    const [editingMusicianId, setEditingMusicianId] = useState<number | null>(null);

    useEffect(() => {
        refreshSetMusicians();
        // eslint-disable-next-line
    }, [set.id]);

    async function refreshSetMusicians() {
        setMusiciansLoading(true);
        try {
            const res = await fetch(`/api/admin/events/${eventId}/sets/${set.id}/musicians`);
            const data = await res.json();
            setSetMusicians(data.setMusicians || []);
        } catch {
            showError("Failed to load set musicians");
        } finally {
            setMusiciansLoading(false);
        }
    }

    async function handleDeleteSetMusician(musicianId: number) {
        if (!window.confirm("Remove this musician from this set?")) return;
        try {
            const res = await fetch(`/api/admin/events/${eventId}/sets/${set.id}/musicians/${musicianId}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error();
            showSuccess("Set musician removed");
            refreshSetMusicians();
        } catch {
            showError("Failed to delete set musician");
        }
    }

    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                    <span className="font-semibold mr-2">{set.setType?.displayName || set.setType?.name}</span>
                    {set.band && <span className="text-gray-600 mr-2">{set.band.name}</span>}
                    <span className="text-gray-400">(Position {set.position})</span>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary btn-small" onClick={() => onEditSet(set.id)} type="button">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="btn btn-danger btn-small !bg-red-100 !text-red-700 hover:!bg-red-200" onClick={() => onDeleteSet(set.id)} type="button">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {(set.publicNotes || set.privateNotes) && (
                <div className="text-gray-500 text-sm mb-2">
                    {set.publicNotes && <span>Public: {set.publicNotes} </span>}
                    {set.privateNotes && <span>Private: {set.privateNotes}</span>}
                </div>
            )}
            <details open={setMusicians.length > 0} className="mb-4 bg-gray-50 border border-gray-200 rounded px-3 py-2">
                <summary className="text-sm font-medium select-none cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Set Musicians ({setMusicians.length})</span>
                        <button
                            className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100"
                            onClick={(e) => { e.preventDefault(); setEditingMusicianId(null); setMusicianModalOpen(true); }}
                            type="button"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </summary>
                <div className="mt-2">
                    {musiciansLoading ? (
                        <div className="text-sm text-gray-500">Loading...</div>
                    ) : setMusicians.length === 0 ? (
                        <div className="text-sm text-gray-400">No set musicians</div>
                    ) : (
                        <div className="space-y-1">
                            {setMusicians.map((sm: any) => (
                                <div key={sm.id} className="flex items-center justify-between text-sm py-1">
                                    <span>
                                        {sm.musician?.name}
                                        {sm.instrument && <span className="text-gray-500">, {sm.instrument.displayName}</span>}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-secondary btn-small"
                                            onClick={() => { setEditingMusicianId(sm.musicianId); setMusicianModalOpen(true); }}
                                            type="button"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="btn btn-danger btn-small !bg-red-100 !text-red-700 hover:!bg-red-200"
                                            onClick={() => handleDeleteSetMusician(sm.musicianId)}
                                            type="button"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </details>
            <div className="mt-4 space-y-2">
                {set.performances && set.performances.length > 0 ? (
                    set.performances.map((perf: any) => (
                        <SortablePerformance
                            key={perf.id}
                            perf={perf}
                            setId={set.id}
                            onEdit={onEditPerformance}
                            onDelete={onDeletePerformance}
                        />
                    ))
                ) : (
                    <div className="text-gray-400">No performances in this set.</div>
                )}
                <div className="flex justify-end">
                    <button
                        ref={addPerfButtonRef}
                        className="btn btn-secondary btn-small !bg-green-50 !text-green-700 hover:!bg-green-100 mt-2"
                        onClick={() => onAddPerformance(set.id)}
                        type="button"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <Modal isOpen={musicianModalOpen} onClose={() => setMusicianModalOpen(false)} title={editingMusicianId ? "Edit Set Musician" : "Add Set Musician"}>
                <SetMusicianForm
                    eventId={eventId}
                    setId={set.id}
                    musicianId={editingMusicianId ?? undefined}
                    onSuccess={() => {
                        setMusicianModalOpen(false);
                        showSuccess("Set musician saved");
                        refreshSetMusicians();
                    }}
                    onCancel={() => setMusicianModalOpen(false)}
                />
            </Modal>
        </div>
    );
}

function SortablePerformance({
    perf,
    setId,
    onEdit,
    onDelete
}: {
    perf: any;
    setId: number;
    onEdit: (setId: number, perfId: number) => void;
    onDelete: (setId: number, perfId: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: perf.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between gap-2 rounded p-1 ${isDragging ? 'bg-blue-100 border-2 border-blue-500' : ''} ${isOver ? 'border-t-2 border-blue-400' : ''}`}
        >
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded flex-shrink-0">
                    <GripVertical className="w-3 h-3 text-gray-400" />
                </button>
                {renderPerformanceDisplay(perf)}
                {perf.publicNotes && <span className="ml-1">📝</span>}
                {perf.isMedley && <span className="ml-1">🎵</span>}
                {perf.performanceMusicians && perf.performanceMusicians.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                        {perf.performanceMusicians.map((pm: any) => (
                            <span key={pm.id} className="inline-block px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded whitespace-nowrap">
                                {pm.musician?.name}, {pm.instrument?.displayName || 'vocals'}
                            </span>
                        ))}
                    </div>
                )}
                {perf.song?.songTags && perf.song.songTags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                        {perf.song.songTags.map((st: any) => (
                            <span key={st.tag.id} className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                                {st.tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button className="btn btn-secondary btn-small" onClick={() => onEdit(setId, perf.id)} type="button">
                    <Edit2 className="w-4 h-4" />
                </button>
                <button className="btn btn-danger btn-small !bg-red-100 !text-red-700 hover:!bg-red-200" onClick={() => onDelete(setId, perf.id)} type="button">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}