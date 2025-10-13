import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";
import Modal from "@/components/ui/Modal";
import SetForm from "@/components/admin/SetForm";
import PerformanceEditor from "@/components/admin/PerformanceEditor";
import { Edit2, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

    const handleSetDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sets.findIndex(s => s.id === active.id);
        const newIndex = sets.findIndex(s => s.id === over.id);

        const reorderedSets = [...sets];
        const [movedSet] = reorderedSets.splice(oldIndex, 1);
        reorderedSets.splice(newIndex, 0, movedSet);

        setSets(reorderedSets);

        try {
            const setIds = reorderedSets.map(s => s.id);
            const res = await fetch(`/api/admin/events/${eventId}/sets/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ setIds })
            });
            if (!res.ok) throw new Error();
            showSuccess('Sets reordered');
        } catch {
            showError('Error reordering sets');
            refreshSets();
        }
    };

    return (
        <section className="mb-8">
            <details open={sets.length > 0}>
                <summary className="text-lg font-medium select-none cursor-pointer flex items-center">
                    <button className="btn btn-primary btn-small mr-4" onClick={handleAddSet} type="button">
                        + Add Set
                    </button>
                    Sets & Performances ({sets.length})
                </summary>
                {loading ? (
                    <div className="mt-4">Loading sets...</div>
                ) : sets.length === 0 ? (
                    <div className="mt-4 text-gray-500">No sets yet. Add a set to begin.</div>
                ) : (
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleSetDragEnd}>
                        <SortableContext items={sets.map(s => s.id)} strategy={verticalListSortingStrategy}>
                            <div className="mt-4 grid grid-cols-3 gap-4">
                                {sets.map(set => (
                                    <SortableSetCard
                                        key={set.id}
                                        set={set}
                                        eventId={eventId}
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
                        onSuccess={() => {
                            setPerfModalOpen(false);
                            showSuccess(editingPerformance.perfId ? "Performance updated" : "Performance added");
                            refreshSets();
                        }}
                        onCancel={() => setPerfModalOpen(false)}
                    />
                )}
            </Modal>
        </section>
    );
}

function SortableSetCard({
    set,
    eventId,
    onEditSet,
    onDeleteSet,
    onAddPerformance,
    onEditPerformance,
    onDeletePerformance
}: {
    set: any;
    eventId: number;
    onEditSet: (setId: number) => void;
    onDeleteSet: (setId: number) => void;
    onAddPerformance: (setId: number) => void;
    onEditPerformance: (setId: number, perfId: number) => void;
    onDeletePerformance: (setId: number, perfId: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: set.id });
    const [localPerformances, setLocalPerformances] = useState(set.performances || []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    useEffect(() => {
        setLocalPerformances(set.performances || []);
    }, [set.performances]);

    const handlePerformanceDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = localPerformances.findIndex((p: any) => p.id === active.id);
        const newIndex = localPerformances.findIndex((p: any) => p.id === over.id);

        const reordered = arrayMove(localPerformances, oldIndex, newIndex);
        setLocalPerformances(reordered);

        try {
            const performanceIds = reordered.map((p: any) => p.id);
            const res = await fetch(`/api/admin/events/${eventId}/sets/${set.id}/performances/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ performanceIds })
            });
            if (!res.ok) throw new Error();
        } catch (err) {
            console.error('Failed to reorder performances', err);
            setLocalPerformances(set.performances || []);
        }
    };

    return (
        <div ref={setNodeRef} style={style} className={`border rounded-lg p-4 ${isDragging ? 'border-blue-500 border-2 shadow-lg' : ''}`}>
            <div className="flex items-center gap-3 mb-2">
                <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                </button>
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
            <DndContext collisionDetection={closestCenter} onDragEnd={handlePerformanceDragEnd}>
                <SortableContext items={localPerformances.map((p: any) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="mt-4 space-y-2">
                        {localPerformances.length > 0 ? (
                            localPerformances.map((perf: any) => (
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
                        <button className="btn btn-primary btn-small mt-2" onClick={() => onAddPerformance(set.id)} type="button">
                            + Add Performance
                        </button>
                    </div>
                </SortableContext>
            </DndContext>
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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: perf.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-center justify-between gap-2 ${isDragging ? 'bg-blue-50' : ''}`}>
            <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                <button type="button" {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded flex-shrink-0">
                    <GripVertical className="w-3 h-3 text-gray-400" />
                </button>
                <span className="whitespace-nowrap">{renderPerformanceDisplay(perf)}</span>
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