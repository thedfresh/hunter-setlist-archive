"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/hooks/useToast";
import { generateSlugFromName } from "@/lib/utils/generateSlug";
import BandMemberForm from "@/components/admin/BandMemberForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";

function formatDate(date: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
}

export default function BandDetailPage({ params }: { params: { id: string } }) {
    const bandId = Number(params.id);
    const [band, setBand] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(0);
    const [form, setForm] = useState({
        name: "",
        slug: "",
        slugManuallyEdited: false,
        publicNotes: "",
        privateNotes: ""
    });
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/bands/${bandId}`)
            .then(res => res.json())
            .then(data => {
                const bandData = data.band || data;
                setBand(bandData);
                setForm({
                    name: bandData.name || "",
                    slug: bandData.slug || "",
                    slugManuallyEdited: false,
                    publicNotes: bandData.publicNotes || "",
                    privateNotes: bandData.privateNotes || "",
                });
            })
            .catch(() => setError("Failed to load band"))
            .finally(() => setLoading(false));
    }, [bandId]);

    useEffect(() => {
        if (!form.slugManuallyEdited && form.name) {
            setForm(f => ({ ...f, slug: generateSlugFromName(f.name) }));
        }
    }, [form.name, form.slugManuallyEdited]);

    async function handleMetaSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) {
            setError("Name is required");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/bands/${bandId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    slug: form.slug.trim(),
                    publicNotes: form.publicNotes.trim(),
                    privateNotes: form.privateNotes.trim(),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            showToast("Band updated", "success");
            setBand((prev: any) => ({ ...prev, ...form }));
        } catch (err: any) {
            if (err?.message?.toLowerCase().includes('slug')) {
                setError('Slug must be unique');
            } else {
                setError(err?.message || "Failed to save band");
            }
            showToast("Failed to save band", "error");
        } finally {
            setSaving(false);
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

    function closeModal() {
        setModalOpen(false);
        setEditingId(0);
    }

    async function handleMemberRemove(id: number) {
        if (!confirm("Remove this member?")) return;
        try {
            const res = await fetch(`/api/admin/band-musicians/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to remove");
            showToast("Member removed", "success");
            setLoading(true);
            fetch(`/api/bands/${bandId}`)
                .then(res => res.json())
                .then(data => setBand(data.band || data))
                .finally(() => setLoading(false));
        } catch (err: any) {
            showToast(err?.message || "Failed to remove member", "error");
        }
    }

    function handleMemberSuccess() {
        closeModal();
        setLoading(true);
        fetch(`/api/bands/${bandId}`)
            .then(res => res.json())
            .then(data => setBand(data.band || data))
            .finally(() => setLoading(false));
    }

    return (
        <div>
            <Breadcrumbs items={[
                { label: "Home", href: "/admin" },
                { label: "Bands", href: "/admin/bands" },
                { label: band?.name || "Band" }
            ]} />

            <div className="page-header mb-6">
                <h1 className="page-title">{band?.name || "Band"}</h1>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading...</div>
                </div>
            ) : band ? (
                <>
                    <form onSubmit={handleMetaSave} className="mb-8">
                        {/* Row 1: Name and Slug */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="form-label form-label-required" htmlFor="name">Name</label>
                                <input
                                    id="name"
                                    className="input"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    disabled={saving}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="slug">Slug</label>
                                <input
                                    id="slug"
                                    className="input"
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value, slugManuallyEdited: true }))}
                                    disabled={saving}
                                />
                                <p className="form-help">Auto-generated</p>
                            </div>
                        </div>

                        {/* Row 2: Public and Private Notes */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="form-label" htmlFor="publicNotes">Public Notes</label>
                                <textarea
                                    id="publicNotes"
                                    className="textarea"
                                    value={form.publicNotes}
                                    onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))}
                                    disabled={saving}
                                    rows={2}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="privateNotes">Private Notes</label>
                                <textarea
                                    id="privateNotes"
                                    className="textarea"
                                    value={form.privateNotes}
                                    onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
                                    disabled={saving}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {error && <div className="form-error mb-4">{error}</div>}

                        <div className="flex gap-3 justify-end">
                            <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Saving...</> : 'Save'}
                            </button>
                        </div>
                    </form>

                    <hr className="my-8" />

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-header">Members ({band.bandMusicians?.length || 0})</h2>
                        <button className="btn btn-primary btn-medium" onClick={openAddModal}>
                            <span>+</span>
                            <span>Add Member</span>
                        </button>
                    </div>

                    {band.bandMusicians?.length > 0 ? (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Musician</th>
                                        <th>Joined</th>
                                        <th>Left</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {band.bandMusicians.map((bm: any) => (
                                        <tr key={bm.id}>
                                            <td>{bm.musician?.name || "—"}</td>
                                            <td>{formatDate(bm.joinedDate)}</td>
                                            <td>{formatDate(bm.leftDate)}</td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn btn-secondary btn-small"
                                                        onClick={() => openEditModal(bm.id)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-small"
                                                        onClick={() => handleMemberRemove(bm.id)}
                                                    >
                                                        Remove
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
                            <div className="empty-title">No members found</div>
                        </div>
                    )}

                    <Modal
                        isOpen={modalOpen}
                        onClose={closeModal}
                        title={editingId === 0 ? "Add Member" : "Edit Member"}
                    >
                        <BandMemberForm
                            bandId={bandId}
                            membershipId={editingId}
                            onSuccess={handleMemberSuccess}
                            onCancel={closeModal}
                        />
                    </Modal>
                </>
            ) : null}
        </div>
    );
}