"use client";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { useToast } from "@/lib/hooks/useToast";
import { formatEventDate } from "@/lib/formatters/dateFormatter";
import { generateSlugFromName } from "@/lib/utils/generateSlug";
import { useRouter } from 'next/navigation';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink } from 'lucide-react';

export default function SongAdminDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const songId = Number(params.id);
    const [song, setSong] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        title: "",
        slug: "",
        alternateTitle: "",
        originalArtist: "",
        songBy: "",
        lyricsBy: "",
        musicBy: "",
        leadVocalsId: 0,
        arrangement: "",
        parentSongId: 0,
        isUncertain: false,
        inBoxOfRain: false,
        privateNotes: "",
    });
    const [publicNotes, setPublicNotes] = useState("");
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [savingNotes, setSavingNotes] = useState(false);
    const [linkTypes, setLinkTypes] = useState<any[]>([]);
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLink, setNewLink] = useState({ url: '', title: '', linkTypeId: 0 });
    const [linkError, setLinkError] = useState('');
    const [musicians, setMusicians] = useState<any[]>([]);
    const [allSongs, setAllSongs] = useState<any[]>([]);
    const [songSearch, setSongSearch] = useState("");
    const [activeTab, setActiveTab] = useState<'notes' | 'performances'>('notes');
    const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
    const [showAddTag, setShowAddTag] = useState(false);
    const [selectedTagId, setSelectedTagId] = useState(0);
    const [allTags, setAllTags] = useState<any[]>([]);
    const [tagError, setTagError] = useState('');

    useEffect(() => {
        setLoading(true);

        // Fetch song data
        fetch(`/api/songs/${songId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setSong(data.song);
                setForm({
                    title: data.song.title || "",
                    slug: data.song.slug || "",
                    alternateTitle: data.song.alternateTitle || "",
                    originalArtist: data.song.originalArtist || "",
                    songBy: data.song.songBy || "",
                    lyricsBy: data.song.lyricsBy || "",
                    musicBy: data.song.musicBy || "",
                    leadVocalsId: data.song.leadVocalsId || 0,
                    arrangement: data.song.arrangement || "",
                    parentSongId: data.song.parentSongId || 0,
                    isUncertain: !!data.song.isUncertain,
                    inBoxOfRain: !!data.song.inBoxOfRain,
                    privateNotes: data.song.privateNotes || "",
                });
                setPublicNotes(data.song.publicNotes || "");
                setError("");
            })
            .catch(err => {
                setError(err.message || "Failed to load song");
            })
            .finally(() => setLoading(false));

        fetch('/api/tags')
            .then(res => res.json())
            .then(data => setAllTags(data.tags || []))
            .catch(err => console.error('Failed to fetch tags:', err));

        // Fetch musicians
        fetch('/api/musicians')
            .then(res => res.json())
            .then(data => setMusicians(data.musicians || []))
            .catch(err => console.error('Failed to fetch musicians:', err));

        // Fetch link types
        fetch('/api/link-types')
            .then(res => res.json())
            .then(data => setLinkTypes(data.linkTypes || []))
            .catch(err => console.error('Failed to fetch link types:', err));

        // Fetch all songs for parent selector
        fetch('/api/songs')
            .then(res => res.json())
            .then(data => setAllSongs(data.songs || []))
            .catch(err => console.error('Failed to fetch songs:', err));
    }, [songId]);

    useEffect(() => {
        if (form.title) {
            setForm(f => ({ ...f, slug: generateSlugFromName(form.title) }));
        }
    }, [form.title]);

    async function handleAddTag() {
        setTagError('');
        if (selectedTagId === 0) {
            setTagError('Please select a tag');
            return;
        }

        try {
            const res = await fetch('/api/admin/song-tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    songId: songId,
                    tagId: selectedTagId
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add tag');

            showToast('Tag added', 'success');
            setShowAddTag(false);
            setSelectedTagId(0);
            refreshSong();
        } catch (err: any) {
            setTagError(err.message || 'Failed to add tag');
        }
    }

    async function handleDeleteTag(songTagId: number) {
        if (!confirm('Remove this tag?')) return;

        try {
            const res = await fetch(`/api/admin/song-tags/${songTagId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            showToast('Tag removed', 'success');
            refreshSong();
        } catch (err: any) {
            showToast(err.message || 'Failed to remove tag', 'error');
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        if (!form.title.trim()) {
            setError("Title is required");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/songs/${songId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    slug: form.slug.trim(),
                    alternateTitle: form.alternateTitle.trim(),
                    originalArtist: form.originalArtist.trim(),
                    songBy: form.songBy.trim(),
                    lyricsBy: form.lyricsBy.trim(),
                    musicBy: form.musicBy.trim(),
                    leadVocalsId: form.leadVocalsId === 0 ? null : form.leadVocalsId,
                    arrangement: form.arrangement.trim(),
                    parentSongId: form.parentSongId === 0 ? null : form.parentSongId,
                    isUncertain: form.isUncertain,
                    inBoxOfRain: form.inBoxOfRain,
                    privateNotes: form.privateNotes.trim(),
                    publicNotes: publicNotes.trim(), // ADD THIS
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            showToast("Song updated", "success");
            refreshSong();
        } catch (err: any) {
            if (err?.message?.toLowerCase().includes("slug")) {
                setError("Slug must be unique");
            } else {
                setError(err?.message || "Failed to save");
            }
            showToast("Failed to save song", "error");
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveNotes() {
        setSavingNotes(true);
        try {
            const res = await fetch(`/api/admin/songs/${songId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    slug: form.slug.trim(),
                    alternateTitle: form.alternateTitle.trim(),
                    originalArtist: form.originalArtist.trim(),
                    songBy: form.songBy.trim(),
                    lyricsBy: form.lyricsBy.trim(),
                    musicBy: form.musicBy.trim(),
                    leadVocalsId: form.leadVocalsId === 0 ? null : form.leadVocalsId,
                    isUncertain: form.isUncertain,
                    inBoxOfRain: form.inBoxOfRain,
                    privateNotes: form.privateNotes.trim(),
                    publicNotes: publicNotes.trim(), // Same data
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Save failed");
            showToast("Public notes saved", "success");
            refreshSong();
        } catch (err: any) {
            showToast("Failed to save notes", "error");
        } finally {
            setSavingNotes(false);
        }
    }

    function refreshSong() {
        fetch(`/api/songs/${songId}`)
            .then(res => res.json())
            .then(data => {
                setSong(data.song);
                setForm({
                    title: data.song.title || "",
                    slug: data.song.slug || "",
                    alternateTitle: data.song.alternateTitle || "",
                    originalArtist: data.song.originalArtist || "",
                    songBy: data.song.songBy || "",
                    lyricsBy: data.song.lyricsBy || "",
                    musicBy: data.song.musicBy || "",
                    leadVocalsId: data.song.leadVocalsId || 0,
                    arrangement: data.song.arrangement || "",
                    parentSongId: data.song.parentSongId || 0,
                    isUncertain: !!data.song.isUncertain,
                    inBoxOfRain: !!data.song.inBoxOfRain,
                    privateNotes: data.song.privateNotes || "",
                });
                setPublicNotes(data.song.publicNotes || "");
            });
    }

    const sortedPerformances = song?.performances
        ? [...song.performances].sort((a: any, b: any) => {
            const aDate = a.set?.event?.sortDate ? new Date(a.set.event.sortDate) : null;
            const bDate = b.set?.event?.sortDate ? new Date(b.set.event.sortDate) : null;

            // Both have dates - compare them
            if (aDate && bDate) return aDate.getTime() - bDate.getTime();

            // Only a has date - a comes first
            if (aDate && !bDate) return -1;

            // Only b has date - b comes first
            if (!aDate && bDate) return 1;

            // Neither has date - maintain original order
            return 0;
        })
        : [];

    async function handleAddLink() {
        setLinkError('');
        if (!newLink.url.trim()) {
            setLinkError('URL is required');
            return;
        }

        try {
            const url = editingLinkId
                ? `/api/admin/links/${editingLinkId}`
                : '/api/admin/links';

            const method = editingLinkId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: newLink.url.trim(),
                    title: newLink.title.trim() || null,
                    linkTypeId: newLink.linkTypeId === 0 ? null : newLink.linkTypeId,
                    description: null,
                    isActive: true,
                    entityType: 'song',
                    entityId: songId,
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save link');

            showToast(editingLinkId ? 'Link updated' : 'Link added', 'success');
            setShowAddLink(false);
            setEditingLinkId(null);
            setNewLink({ url: '', title: '', linkTypeId: 0 });
            refreshSong();
        } catch (err: any) {
            setLinkError(err.message || 'Failed to save link');
        }
    }

    async function handleDeleteLink(linkId: number) {
        if (!confirm('Delete this link?')) return;

        try {
            const res = await fetch(`/api/admin/links/${linkId}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            showToast('Link deleted', 'success');
            refreshSong();
        } catch (err: any) {
            showToast(err.message || 'Failed to delete link', 'error');
        }
    }

    return (
        <div>
            <Breadcrumbs items={[
                { label: "Home", href: "/admin" },
                { label: "Songs", href: "/admin/songs" },
                { label: song?.title || "Song" }
            ]} />

            <div className="page-header mb-6">
                <h1 className="page-title">{song?.title || "Song"}</h1>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <div className="loading-text">Loading song...</div>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSave} className="mb-8">
                        {/* Row 1: Title, Slug, Alternate Title, Lead Vocals */}
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            <div>
                                <label className="form-label form-label-required" htmlFor="title">Title</label>
                                <input
                                    id="title"
                                    className="input"
                                    value={form.title}
                                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                                    disabled={saving}
                                />
                                <p className="form-help">Auto-generated</p>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="alternateTitle">Alternate Title</label>
                                <input
                                    id="alternateTitle"
                                    className="input"
                                    value={form.alternateTitle}
                                    onChange={e => setForm(f => ({ ...f, alternateTitle: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="leadVocalsId">Lead Vocals</label>
                                <select
                                    id="leadVocalsId"
                                    className="select"
                                    value={form.leadVocalsId}
                                    onChange={e => setForm(f => ({ ...f, leadVocalsId: Number(e.target.value) }))}
                                    disabled={saving}
                                >
                                    <option value="0">Default (Hunter)</option>
                                    {musicians.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <p className="form-help">Override default</p>
                            </div>
                        </div>

                        {/* Row 2: Original Artist, Song By, Lyrics By, Music By */}
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            <div>
                                <label className="form-label" htmlFor="originalArtist">Original Artist</label>
                                <input
                                    id="originalArtist"
                                    className="input"
                                    value={form.originalArtist}
                                    onChange={e => setForm(f => ({ ...f, originalArtist: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="songBy">Song By</label>
                                <input
                                    id="songBy"
                                    className="input"
                                    value={form.songBy}
                                    onChange={e => setForm(f => ({ ...f, songBy: e.target.value }))}
                                    disabled={saving}
                                    placeholder="Combined credits"
                                />
                                <p className="form-help">Use instead of split credits</p>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="lyricsBy">Lyrics By</label>
                                <input
                                    id="lyricsBy"
                                    className="input"
                                    value={form.lyricsBy}
                                    onChange={e => setForm(f => ({ ...f, lyricsBy: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="musicBy">Music By</label>
                                <input
                                    id="musicBy"
                                    className="input"
                                    value={form.musicBy}
                                    onChange={e => setForm(f => ({ ...f, musicBy: e.target.value }))}
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Row 3: Arrangement, Parent Song, Checkboxes, Private Notes */}
                        <div className="grid grid-cols-4 gap-4 mb-5">
                            <div>
                                <label className="form-label" htmlFor="arrangement">Arrangement</label>
                                <input
                                    id="arrangement"
                                    className="input"
                                    value={form.arrangement}
                                    onChange={e => setForm(f => ({ ...f, arrangement: e.target.value }))}
                                    disabled={saving}
                                    placeholder="1967, acoustic, etc."
                                />
                                <p className="form-help">Variant description</p>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="parentSongId">Parent Song</label>
                                <select
                                    id="parentSongId"
                                    className="select"
                                    value={form.parentSongId}
                                    onChange={e => setForm(f => ({ ...f, parentSongId: Number(e.target.value) }))}
                                    disabled={saving}
                                >
                                    <option value="0">None (canonical)</option>
                                    {allSongs
                                        .filter(s => s.id !== songId)
                                        .sort((a, b) => a.title.localeCompare(b.title))
                                        .map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.title} {s.arrangement ? `(${s.arrangement})` : ''}
                                            </option>
                                        ))
                                    }
                                </select>
                                <p className="form-help">Link if variant</p>
                            </div>
                            <div>
                                <label className="form-label mb-2 block">Flags</label>
                                <div className="flex flex-col gap-2">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            className="checkbox-input"
                                            checked={form.isUncertain}
                                            onChange={e => setForm(f => ({ ...f, isUncertain: e.target.checked }))}
                                            disabled={saving}
                                        />
                                        Uncertain
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            className="checkbox-input"
                                            checked={form.inBoxOfRain}
                                            onChange={e => setForm(f => ({ ...f, inBoxOfRain: e.target.checked }))}
                                            disabled={saving}
                                        />
                                        Box of Rain
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="privateNotes">Private Notes</label>
                                <textarea
                                    id="privateNotes"
                                    className="textarea"
                                    value={form.privateNotes}
                                    onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
                                    disabled={saving}
                                    rows={4}
                                    placeholder="Internal notes..."
                                />
                            </div>
                        </div>

                        {error && <div className="form-error mb-4">{error}</div>}

                        <div className="flex gap-3 justify-end">
                            <button type="submit" className="btn btn-primary btn-medium" disabled={saving}>
                                {saving ? <><span className="spinner"></span> Saving...</> : 'Save Metadata'}
                            </button>
                        </div>
                    </form>
                    {/* Links Section */}
                    <section className="mb-8 max-w-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <label className="form-label">Links ({song?.links?.length || 0})</label>
                            <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={() => {
                                    setShowAddLink(!showAddLink);
                                    setEditingLinkId(null);
                                    setNewLink({ url: '', title: '', linkTypeId: 0 });
                                    setLinkError('');
                                }}
                            >
                                {showAddLink ? 'Cancel' : 'Add Link'}
                            </button>
                        </div>

                        {song?.links && song.links.length > 0 && (
                            <div className="space-y-2 mb-2 border border-gray-200 rounded p-2">
                                {song.links.map((link: any) => (
                                    <div key={link.id} className="p-2 bg-gray-50 rounded">
                                        <div className="flex items-center justify-between mb-1">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold truncate flex-1 text-sm flex items-center gap-1 hover:text-blue-800">
                                                {link.title || link.url}
                                                <ExternalLink size={14} className="inline flex-shrink-0" />
                                            </a>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-small"
                                                    onClick={() => {
                                                        setNewLink({
                                                            url: link.url,
                                                            title: link.title || '',
                                                            linkTypeId: link.linkTypeId || 0
                                                        });
                                                        setEditingLinkId(link.id);
                                                        setShowAddLink(true);
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-small"
                                                    onClick={() => handleDeleteLink(link.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        {link.linkType && (
                                            <div className="text-xs text-gray-500">
                                                Type: {link.linkType.name}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {showAddLink && (
                            <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <input
                                        type="url"
                                        className="input input-small"
                                        value={newLink.url}
                                        onChange={e => setNewLink(l => ({ ...l, url: e.target.value }))}
                                        placeholder="URL"
                                    />
                                    <input
                                        type="text"
                                        className="input input-small"
                                        value={newLink.title}
                                        onChange={e => setNewLink(l => ({ ...l, title: e.target.value }))}
                                        placeholder="Title"
                                    />
                                    <select
                                        className="select"
                                        value={newLink.linkTypeId}
                                        onChange={e => setNewLink(l => ({ ...l, linkTypeId: Number(e.target.value) }))}
                                    >
                                        <option value="0">Type</option>
                                        {linkTypes.map(lt => (
                                            <option key={lt.id} value={lt.id}>{lt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {linkError && <div className="form-error mb-2 text-xs">{linkError}</div>}
                                <button
                                    type="button"
                                    className="btn btn-primary btn-small"
                                    onClick={handleAddLink}
                                >
                                    {editingLinkId ? 'Update Link' : 'Add Link'}
                                </button>
                            </div>
                        )}
                    </section>
                    {/* Tags Section */}
                    <section className="mb-8 max-w-2xl">
                        <div className="flex items-center justify-between mb-2">
                            <label className="form-label">Tags ({song?.songTags?.length || 0})</label>
                            <button
                                type="button"
                                className="btn btn-secondary btn-small"
                                onClick={() => setShowAddTag(!showAddTag)}
                            >
                                {showAddTag ? 'Cancel' : 'Add Tag'}
                            </button>
                        </div>

                        {song?.songTags && song.songTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {song.songTags.map((st: any) => (
                                    <span key={st.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {st.tag.name}
                                        <button
                                            type="button"
                                            className="hover:text-red-600 transition-colors"
                                            onClick={() => handleDeleteTag(st.id)}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {showAddTag && (
                            <div className="border border-gray-200 rounded p-3 bg-gray-50">
                                <select
                                    className="select mb-2"
                                    value={selectedTagId}
                                    onChange={e => setSelectedTagId(Number(e.target.value))}
                                >
                                    <option value="0">Select tag</option>
                                    {allTags
                                        .filter(t => !song?.songTags?.some((st: any) => st.tag.id === t.id))
                                        .map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                </select>
                                {tagError && <div className="form-error mb-2 text-xs">{tagError}</div>}
                                <button
                                    type="button"
                                    className="btn btn-primary btn-small"
                                    onClick={handleAddTag}
                                >
                                    Add Tag
                                </button>
                            </div>
                        )}
                    </section>


                    <hr className="my-8" />

                    {/* Tabs */}
                    <div className="tabs mb-4">
                        <button
                            className={activeTab === 'notes' ? 'tab tab-active' : 'tab'}
                            onClick={() => setActiveTab('notes')}
                        >
                            Public Notes
                        </button>
                        <button
                            className={activeTab === 'performances' ? 'tab tab-active' : 'tab'}
                            onClick={() => setActiveTab('performances')}
                        >
                            All Performances ({sortedPerformances.length})
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'notes' && (
                        <div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Editor */}
                                <div>
                                    <label className="form-label mb-2 block">Edit</label>
                                    <textarea
                                        className="textarea w-full"
                                        value={publicNotes}
                                        onChange={e => setPublicNotes(e.target.value)}
                                        rows={20}
                                        placeholder="Public notes (markdown supported)..."
                                    />
                                </div>

                                {/* Preview */}
                                <div>
                                    <label className="form-label mb-2 block">Preview</label>
                                    <div className="border border-gray-200 rounded p-4 bg-white min-h-[500px] prose prose-sm max-w-none overflow-auto">
                                        {publicNotes ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {publicNotes}
                                            </ReactMarkdown>
                                        ) : (
                                            <p className="text-gray-400 italic">Nothing to preview</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-medium"
                                    onClick={handleSaveNotes}
                                    disabled={savingNotes}
                                >
                                    {savingNotes ? <><span className="spinner"></span> Saving...</> : 'Save Public Notes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'performances' && (
                        <>
                            {sortedPerformances.length > 0 ? (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Venue</th>
                                                <th>Performer</th>
                                                <th className="text-center w-24">Verified</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedPerformances.map((perf: any) => (
                                                <tr
                                                    key={perf.id}
                                                    onClick={() => router.push(`/admin/events/${perf.set?.event?.id}`)}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                >
                                                    <td>{perf.set?.event ? formatEventDate(perf.set.event) : "—"}</td>
                                                    <td>
                                                        {perf.set?.event?.venue ? formatVenue(perf.set.event.venue) : "—"}
                                                    </td>
                                                    <td>{perf.set?.event?.primaryBand?.name || "Solo"}</td>
                                                    <td className="text-center w-24">{perf.set?.event?.verified ? "✔️" : "❌"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-title">No performances found</div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}