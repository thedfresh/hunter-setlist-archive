"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/lib/hooks/useToast";
import { generateSlugFromName } from "@/lib/utils/generateSlug";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import InstrumentChipSelector from "@/components/admin/InstrumentChipSelector";
import { useRouter } from "next/navigation";

export default function MusicianDetailPage({ params }: { params: { id: string } }) {
    const musicianId = Number(params.id);
    const router = useRouter();
    const [musician, setMusician] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        name: "",
        slug: "",
        firstName: "",
        lastName: "",
        publicNotes: "",
        privateNotes: "",
        isUncertain: false,
    });
    const { showToast } = useToast();
    const [defaultInstruments, setDefaultInstruments] = useState<any[]>([]);
    const [savingInstruments, setSavingInstruments] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/musicians/${musicianId}`)
            .then(res => res.json())
            .then(data => {
                const musicianData = data.musician || data;
                setMusician(musicianData);
                setForm({
                    name: musicianData.name || "",
                    slug: musicianData.slug || "",
                    firstName: musicianData.firstName || "",
                    lastName: musicianData.lastName || "",
                    publicNotes: musicianData.publicNotes || "",
                    privateNotes: musicianData.privateNotes || "",
                    isUncertain: !!musicianData.isUncertain,
                });
                setDefaultInstruments(
                    Array.isArray(musicianData.defaultInstruments)
                        ? musicianData.defaultInstruments.map((ji: any) => ji.instrument ? { id: ji.instrument.id, displayName: ji.instrument.displayName } : null).filter(Boolean)
                        : []
                );
                setInitialLoadComplete(true);
            })
            .catch(() => setError("Failed to load musician"))
            .finally(() => setLoading(false));
    }, [musicianId]);
    async function handleDefaultInstrumentsChange(instruments: any[]) {
        setSavingInstruments(true);
        try {
            const instrumentIds = instruments.map(i => i.id);
            const res = await fetch(`/api/admin/musicians/${musicianId}/instruments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ instrumentIds }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save instruments");
            setDefaultInstruments(
                Array.isArray(data.musician.defaultInstruments)
                    ? data.musician.defaultInstruments.map((ji: any) => ji.instrument ? { id: ji.instrument.id, displayName: ji.instrument.displayName } : null).filter(Boolean)
                    : []
            );
            showToast("Default instruments updated", "success");
        } catch (err: any) {
            showToast(err?.message || "Failed to save instruments", "error");
        } finally {
            setSavingInstruments(false);
        }
    }

    useEffect(() => {
        if (form.name && initialLoadComplete) {
            setForm(f => ({ ...f, slug: generateSlugFromName(f.name) }));
        }
    }, [form.name]);

    async function handleMetaSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) {
            setError("Name is required");
            return;
        }
        setSaving(true);
        try {
            if (musicianId === 0) {
                // Create new musician
                const res = await fetch(`/api/admin/musicians`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: form.name.trim(),
                        slug: form.slug.trim(),
                        firstName: form.firstName.trim(),
                        lastName: form.lastName.trim(),
                        publicNotes: form.publicNotes,
                        privateNotes: form.privateNotes,
                        isUncertain: !!form.isUncertain,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to create musician");
                const newId = data.id || (data.musician && data.musician.id);
                if (newId) {
                    showToast("Musician created", "success");
                    router.push(`/admin/musicians/${newId}`);
                    return;
                } else {
                    throw new Error("Failed to get new musician ID");
                }
            }
            // Update existing musician
            const res = await fetch(`/api/admin/musicians/${musicianId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    slug: form.slug.trim(),
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    publicNotes: form.publicNotes,
                    privateNotes: form.privateNotes,
                    isUncertain: !!form.isUncertain,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            showToast("Musician updated", "success");
            fetch(`/api/admin/musicians/${musicianId}`)
                .then(res => res.json())
                .then(data => {
                    const musicianData = data.musician || data;
                    setMusician(musicianData);
                    setForm({
                        name: musicianData.name || "",
                        slug: musicianData.slug || "",
                        firstName: musicianData.firstName || "",
                        lastName: musicianData.lastName || "",
                        publicNotes: musicianData.publicNotes || "",
                        privateNotes: musicianData.privateNotes || "",
                        isUncertain: !!musicianData.isUncertain,
                    });
                });
        } catch (err: any) {
            if (err?.message?.toLowerCase().includes('slug')) {
                setError('Slug must be unique');
            } else {
                setError(err?.message || "Failed to save musician");
            }
            showToast("Failed to save musician", "error");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div>
            <Breadcrumbs items={[
                { label: "Home", href: "/admin" },
                { label: "Musicians", href: "/admin/musicians" },
                { label: musician?.name || "Musician" }
            ]} />

            <div className="page-header mb-6">
                <h1 className="page-title">{musician?.name || "Musician"}</h1>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading...</div>
                </div>
            ) : musician ? (
                <>
                    <form onSubmit={handleMetaSave} className="mb-8">
                        {/* Row 1: Name and Slug */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="form-group">
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
                            <div className="form-group">
                                <label className="form-label" htmlFor="slug">Slug</label>
                                <input
                                    id="slug"
                                    className="input"
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    disabled={saving}
                                />
                                <p className="form-help">Auto-generated</p>
                            </div>
                        </div>

                        {/* Row 2: First Name and Last Name */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="form-group">
                                <label className="form-label" htmlFor="firstName">First Name <span className="form-help">(used for sorting only)</span></label>
                                <input
                                    id="firstName"
                                    className="input"
                                    value={form.firstName}
                                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    className="input"
                                    value={form.lastName}
                                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Row 3: Public and Private Notes */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <div className="form-group">
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
                            <div className="form-group">
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

                        {/* isUncertain Checkbox */}
                        <div className="form-group mb-5">
                            <label className="form-label" htmlFor="isUncertain">
                                <input
                                    type="checkbox"
                                    id="isUncertain"
                                    checked={form.isUncertain}
                                    onChange={e => setForm(f => ({ ...f, isUncertain: e.target.checked }))}
                                    disabled={saving}
                                    className="mr-2"
                                />
                                Uncertain/Unconfirmed
                            </label>
                        </div>

                        {error && <div className="form-error mb-4">{error}</div>}

                        <div className="flex gap-3 justify-end">
                            <button type="submit" className="btn btn-primary btn-small" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Saving...</> : 'Save'}
                            </button>
                        </div>
                    </form>

                    {/* Default Instruments Section */}
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="section-header">Default Instruments ({defaultInstruments.length})</h2>
                            {savingInstruments && <span className="spinner"></span>}
                        </div>
                        <InstrumentChipSelector
                            selectedInstruments={defaultInstruments}
                            onChange={handleDefaultInstrumentsChange}
                            disabled={savingInstruments}
                        />
                    </section>
                </>
            ) : null}
        </div>
    );
}
