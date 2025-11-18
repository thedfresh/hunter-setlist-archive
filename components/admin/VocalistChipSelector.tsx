import { useState, useEffect } from "react";

interface Vocalist {
    id?: number;
    musicianId: number | null;
    musician: { name: string } | null;
    vocalRole: string;
}

interface VocalistChipSelectorProps {
    selectedVocalists: Vocalist[];
    onChange: (updated: Vocalist[]) => void;
    disabled?: boolean;
    allowUnknown?: boolean;
    roleOptions?: string[];
}

const DEFAULT_ROLES = ["lead", "harmony", "group"];

export default function VocalistChipSelector({
    selectedVocalists,
    onChange,
    disabled = false,
    allowUnknown = false,
    roleOptions = DEFAULT_ROLES,
}: VocalistChipSelectorProps) {
    const [musicians, setMusicians] = useState<any[]>([]);
    const [tempMusicianId, setTempMusicianId] = useState<number | null>(null);
    const [addingRole, setAddingRole] = useState<string>("");
    const [addingOpen, setAddingOpen] = useState(false);
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editingRole, setEditingRole] = useState<string>("");
    const [editingOpen, setEditingOpen] = useState(false);

    useEffect(() => {
        fetch("/api/musicians")
            .then((res) => res.json())
            .then((data) => setMusicians(data.musicians || []));
    }, []);

    // Filter out already selected
    const availableMusicians = musicians.filter(
        (m) => !selectedVocalists.some((v) => v.musicianId === m.id)
    );

    // Add new vocalist
    const handleAddConfirm = () => {
        if (!addingRole) return;
        if (tempMusicianId === null) {
            onChange([
                ...selectedVocalists,
                { musicianId: null, musician: null, vocalRole: addingRole },
            ]);
        } else {
            const musician = musicians.find((m) => m.id === tempMusicianId);
            let displayName = "";
            if (musician) {
                displayName = musician.displayName || (musician.firstName && musician.lastName
                    ? `${musician.firstName} ${musician.lastName}`
                    : musician.name);
            }
            onChange([
                ...selectedVocalists,
                { musicianId: tempMusicianId, musician: { name: displayName }, vocalRole: addingRole },
            ]);
        }
        setTempMusicianId(null);
        setAddingRole("");
        setAddingOpen(false);
    };

    const handleAddCancel = () => {
        setTempMusicianId(null);
        setAddingRole("");
        setAddingOpen(false);
    };

    // Remove vocalist
    const handleRemove = (idx: number) => {
        const updated = [...selectedVocalists];
        updated.splice(idx, 1);
        onChange(updated);
    };

    // Edit role
    const handleEditRole = (idx: number) => {
        setEditingIdx(idx);
        setEditingRole(selectedVocalists[idx].vocalRole);
        setEditingOpen(true);
    };

    const handleEditSave = () => {
        if (editingIdx === null || !editingRole) return;
        const updated = [...selectedVocalists];
        updated[editingIdx] = {
            ...updated[editingIdx],
            vocalRole: editingRole,
        };
        onChange(updated);
        setEditingIdx(null);
        setEditingRole("");
        setEditingOpen(false);
    };

    const handleEditCancel = () => {
        setEditingIdx(null);
        setEditingRole("");
        setEditingOpen(false);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedVocalists.map((v, idx) => (
                    <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                        style={{ minWidth: 0 }}
                    >
                        <span>
                            {v.musicianId === null
                                ? "Group vocals"
                                : `${v.musician?.name || "Unknown"}`}
                            {" "}
                            <span className="text-xs font-normal">({v.vocalRole})</span>
                        </span>
                        <button
                            type="button"
                            className="btn btn-small btn-secondary"
                            style={{ padding: "0 0.5rem" }}
                            onClick={() => !disabled && handleEditRole(idx)}
                            disabled={disabled}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            className="ml-1 text-blue-500 hover:text-blue-700"
                            onClick={() => handleRemove(idx)}
                            disabled={disabled}
                            aria-label="Remove vocalist"
                        >
                            ×
                        </button>
                        {editingOpen && editingIdx === idx && (
                            <div className="flex items-center gap-2 ml-2">
                                <select
                                    className="select input-small"
                                    value={editingRole}
                                    onChange={(e) => setEditingRole(e.target.value)}
                                    disabled={disabled}
                                >
                                    <option value="">Select role</option>
                                    {roleOptions.map((role) => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="btn btn-small btn-primary"
                                    onClick={handleEditSave}
                                    disabled={disabled || !editingRole}
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-small btn-secondary"
                                    onClick={handleEditCancel}
                                    disabled={disabled}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex flex-col gap-2 items-start">
                <label className="form-label">Add vocalist</label>
                <select
                    className="select input-small"
                    value={tempMusicianId ?? ""}
                    onChange={e => {
                        const val = e.target.value;
                        setTempMusicianId(val === "" ? null : Number(val));
                        setAddingOpen(true);
                    }}
                    disabled={disabled}
                >
                    <option value="">Select musician</option>
                    {availableMusicians.map(m => (
                        <option key={m.id} value={m.id}>{m.displayName || m.name || `ID: ${m.id}`}</option>
                    ))}
                </select>
                {allowUnknown && (
                    <button
                        type="button"
                        className="btn btn-small btn-secondary mt-2"
                        onClick={() => {
                            setTempMusicianId(null);
                            setAddingOpen(true);
                        }}
                        disabled={disabled}
                    >
                        Group vocals
                    </button>
                )}
                {addingOpen && (
                    <div className="flex items-center gap-2 mt-2">
                        <select
                            className="select input-small"
                            value={addingRole}
                            onChange={e => setAddingRole(e.target.value)}
                            disabled={disabled}
                        >
                            <option value="">Select role</option>
                            {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className="btn btn-small btn-primary"
                            onClick={handleAddConfirm}
                            disabled={disabled || !addingRole}
                        >
                            Confirm
                        </button>
                        <button
                            type="button"
                            className="btn btn-small btn-secondary"
                            onClick={handleAddCancel}
                            disabled={disabled}
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
