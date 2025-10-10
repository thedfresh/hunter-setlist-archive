import React, { useState } from "react";
import { compareSongTitles } from '@/lib/utils/songSort';

function PerformanceForm({ setId, songs, musicians, instruments, performances, editingPerformance, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    songId: editingPerformance?.song?.id || "",
    newSongTitle: "",
    performanceOrder:
      editingPerformance?.performanceOrder ||
      (performances.length > 0
        ? Math.max(...performances.map((p: any) => p.performanceOrder)) + 1
        : 1),
    seguesInto: editingPerformance?.seguesInto || false,
    isTruncatedStart: editingPerformance?.isTruncatedStart || false,
    isTruncatedEnd: editingPerformance?.isTruncatedEnd || false,
    hasCuts: editingPerformance?.hasCuts || false,
    isPartial: editingPerformance?.isPartial || false,
    isUncertain: editingPerformance?.isUncertain || false,
    isSoloHunter: editingPerformance?.isSoloHunter || false,
    isLyricalFragment: editingPerformance?.isLyricalFragment || false,
    isMusicalFragment: editingPerformance?.isMusicalFragment || false,
    isMedley: editingPerformance?.isMedley || false,
    publicNotes: editingPerformance?.publicNotes || "",
    privateNotes: editingPerformance?.privateNotes || "",
    leadVocalsId: editingPerformance?.leadVocals?.id || "",
    guestMusicians:
      editingPerformance?.performanceMusicians?.map((pm: any) => ({
        musicianId: pm.musician.id,
        instrumentId: pm.instrument?.id || "",
      })) || [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [songSearch, setSongSearch] = useState("");
  const filteredSongs = songs.filter((s: any) =>
    s.title.toLowerCase().includes(songSearch.toLowerCase())
  );
  const sortedSongs = [...filteredSongs].sort(compareSongTitles);

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!form.songId && !form.newSongTitle)
      newErrors.songId = "Select a song or enter a new title.";
    return newErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setSubmitting(true);
    let songId = form.songId;
    if (!songId && form.newSongTitle) {
      // Create new song
      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.newSongTitle }),
      });
      const data = await res.json();
      if (res.ok && data.song) {
        songId = data.song.id;
      } else {
        setErrors({ songId: "Failed to create song." });
        setSubmitting(false);
        return;
      }
    }
    const payload = {
      songId: Number(songId),
      performanceOrder: Number(form.performanceOrder),
      seguesInto: !!form.seguesInto,
      isTruncatedStart: !!form.isTruncatedStart,
      isTruncatedEnd: !!form.isTruncatedEnd,
      hasCuts: !!form.hasCuts,
      isPartial: !!form.isPartial,
      isUncertain: !!form.isUncertain,
      isSoloHunter: !!form.isSoloHunter,
      isLyricalFragment: !!form.isLyricalFragment,
      isMusicalFragment: !!form.isMusicalFragment,
      isMedley: !!form.isMedley,
      publicNotes: form.publicNotes,
      privateNotes: form.privateNotes,
      leadVocalsId: form.leadVocalsId ? Number(form.leadVocalsId) : null,
      guestMusicians: form.guestMusicians,
    };
    let res;
    if (editingPerformance) {
      res = await fetch(`/api/admin/sets/${setId}/performances/${editingPerformance.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/admin/sets/${setId}/performances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    if (res.ok) {
      onSaved();
    } else {
      setErrors({ form: "Failed to save performance." });
    }
    setSubmitting(false);
  }

  function handleGuestMusicianChange(idx: number, field: string, value: any) {
    setForm((f) => ({
      ...f,
      guestMusicians: f.guestMusicians.map((gm: { musicianId: string; instrumentId: string }, i: number) =>
        i === idx ? { ...gm, [field]: value } : gm
      ),
    }));
  }

  function addGuestMusician() {
    setForm((f) => ({
      ...f,
      guestMusicians: [...f.guestMusicians, { musicianId: "", instrumentId: "" }],
    }));
  }

  function removeGuestMusician(idx: number) {
    setForm((f) => ({
      ...f,
      guestMusicians: f.guestMusicians.filter((_: { musicianId: string; instrumentId: string }, i: number) => i !== idx),
    }));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-5xl w-full mx-auto">
        <h3 className="text-lg font-bold mb-4">
          {editingPerformance ? "Edit Performance" : "Add Performance"}
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Song selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Song<span className="text-red-500">*</span>
            </label>
            <select
              name="songId"
              value={form.songId}
              onChange={(e) => setForm((f) => ({ ...f, songId: e.target.value, newSongTitle: "" }))}
              className={`w-full border rounded-md px-3 py-2 ${errors.songId ? "border-red-500" : "border-gray-300"}`}
            >
              <option value="">Select song</option>
              {sortedSongs.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Or enter new song title"
                value={form.newSongTitle}
                onChange={(e) => setForm((f) => ({ ...f, newSongTitle: e.target.value, songId: "" }))}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>
            {errors.songId && <p className="text-red-500 text-xs mt-1">{errors.songId}</p>}
          </div>
          {/* Performance order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="performanceOrder"
              value={form.performanceOrder}
              min={1}
              onChange={(e) => setForm((f) => ({ ...f, performanceOrder: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          {/* Musical notation checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.seguesInto}
                onChange={(e) => setForm((f) => ({ ...f, seguesInto: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Segues Into</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isTruncatedStart}
                onChange={(e) => setForm((f) => ({ ...f, isTruncatedStart: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Truncated Start</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isTruncatedEnd}
                onChange={(e) => setForm((f) => ({ ...f, isTruncatedEnd: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Truncated End</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.hasCuts}
                onChange={(e) => setForm((f) => ({ ...f, hasCuts: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Has Cuts</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPartial}
                onChange={(e) => setForm((f) => ({ ...f, isPartial: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Partial</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isUncertain}
                onChange={(e) => setForm((f) => ({ ...f, isUncertain: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Uncertain</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isSoloHunter}
                onChange={(e) => setForm((f) => ({ ...f, isSoloHunter: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Robert Hunter</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isLyricalFragment}
                onChange={(e) => setForm((f) => ({ ...f, isLyricalFragment: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Lyrical Fragment</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isMusicalFragment}
                onChange={(e) => setForm((f) => ({ ...f, isMusicalFragment: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Musical Fragment</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isMedley}
                onChange={(e) => setForm((f) => ({ ...f, isMedley: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Medley</span>
            </label>
          </div>
          {/* Guest musicians */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Musicians
            </label>
            {form.guestMusicians.map((gm: { musicianId: string; instrumentId: string }, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={gm.musicianId}
                  onChange={(e) => handleGuestMusicianChange(idx, "musicianId", e.target.value)}
                  className="border rounded-md px-2 py-1"
                >
                  <option value="">Musician</option>
                  {musicians.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <select
                  value={gm.instrumentId}
                  onChange={(e) => handleGuestMusicianChange(idx, "instrumentId", e.target.value)}
                  className="border rounded-md px-2 py-1"
                >
                  <option value="">Instrument</option>
                  {instruments.map((i: any) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-red-600 text-xs py-0.5 px-1 hover:text-red-800"
                  onClick={() => removeGuestMusician(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="bg-gray-200 text-gray-800 text-xs py-1 px-2 rounded hover:bg-gray-300 transition"
              onClick={addGuestMusician}
            >
              Add Guest
            </button>
          </div>
          {/* Lead Vocals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead Vocals
            </label>
            <select
              name="leadVocalsId"
              value={form.leadVocalsId}
              onChange={(e) => setForm((f) => ({ ...f, leadVocalsId: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select musician</option>
              {musicians.map((m: any) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          {/* Public Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Public Notes
            </label>
            <textarea
              name="publicNotes"
              value={form.publicNotes}
              onChange={(e) => setForm((f) => ({ ...f, publicNotes: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              rows={2}
            />
          </div>
          {/* Private Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Private Notes
            </label>
            <textarea
              name="privateNotes"
              value={form.privateNotes}
              onChange={(e) => setForm((f) => ({ ...f, privateNotes: e.target.value }))}
              className="w-full border rounded-md px-3 py-2"
              rows={2}
            />
          </div>
          {errors.form && <p className="text-red-500 text-xs mt-1">{errors.form}</p>}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700 transition"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-800 text-xs py-1 px-2 rounded hover:bg-gray-300 transition"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PerformanceForm;
