import React, { useEffect, useState } from 'react';

interface EventMusician {
  id: number;
  musician: { id: number; name: string };
  instrument: { id: number; displayName: string };
  publicNotes?: string;
  privateNotes?: string;
}

interface Musician {
  id: number;
  name: string;
}

interface Instrument {
  id: number;
  displayName: string;
}

interface Props {
  eventId: number;
}

const EventMusiciansSection: React.FC<Props> = ({ eventId }) => {
  const [eventMusicians, setEventMusicians] = useState<EventMusician[]>([]);
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [editing, setEditing] = useState<EventMusician | null>(null);
  const [form, setForm] = useState({ musicianId: '', instrumentId: '', publicNotes: '', privateNotes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${eventId}/musicians`)
      .then(res => res.json())
      .then(data => setEventMusicians(data.eventMusicians || []));
    fetch('/api/musicians').then(res => res.json()).then(setMusicians);
    fetch('/api/instruments').then(res => res.json()).then(setInstruments);
    async function fetchDropdowns() {
      try {
        const [musiciansRes, instrumentsRes] = await Promise.all([
          fetch("/api/musicians"),
          fetch("/api/instruments"),
        ]);
        const musiciansData = await musiciansRes.json();
        const instrumentsData = await instrumentsRes.json();
        setMusicians(musiciansData.musicians || []);
        setInstruments(instrumentsData.instruments || []);
      } catch {
        // fallback: leave dropdowns empty
      }
    }
    fetchDropdowns();
  }, [eventId]);

  const handleEdit = (em: EventMusician) => {
    setEditing(em);
    setForm({
      musicianId: String(em.musician.id),
      instrumentId: String(em.instrument.id),
      publicNotes: em.publicNotes || '',
      privateNotes: em.privateNotes || '',
    });
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
  await fetch(`/api/admin/events/${eventId}/musicians/${id}`, { method: 'DELETE' });
    setEventMusicians(eventMusicians.filter(em => em.id !== id));
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      musicianId: Number(form.musicianId),
      instrumentId: Number(form.instrumentId),
      publicNotes: form.publicNotes,
      privateNotes: form.privateNotes,
    };
    let res;
    if (editing) {
      res = await fetch(`/api/admin/events/${eventId}/musicians/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      } else {
        res = await fetch(`/api/admin/events/${eventId}/musicians`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
    }
    if (res.ok) {
      const result = await fetch(`/api/events/${eventId}/musicians`).then(r => r.json());
      setEventMusicians(result.eventMusicians || []);
      setEditing(null);
      setForm({ musicianId: '', instrumentId: '', publicNotes: '', privateNotes: '' });
    }
    setLoading(false);
  };

  return (
    <section className="border rounded-lg p-4 bg-white/60 mb-6">
      <div className="font-semibold mb-2">Event Musicians</div>
  <table className="w-full text-sm mb-3">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-1 px-2">Musician</th>
            <th className="text-left py-1 px-2">Instrument</th>
            <th className="text-left py-1 px-2">Notes</th>
            <th className="text-left py-1 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {eventMusicians.map(em => (
            <tr key={em.id} className="border-t">
              <td className="py-1 px-2">{em.musician.name}</td>
              <td className="py-1 px-2">{em.instrument.displayName}</td>
              <td className="py-1 px-2">{em.publicNotes}</td>
              <td className="py-1 px-2">
                <button className="text-blue-600 mr-2" onClick={() => handleEdit(em)}>Edit</button>
                <button className="text-red-600" onClick={() => handleDelete(em.id)} disabled={loading}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  <div className="flex gap-2 items-end">
        <select
          className="border rounded px-2 py-1"
          value={form.musicianId}
          onChange={e => setForm(f => ({ ...f, musicianId: e.target.value }))}
        >
          <option value="">Select musician</option>
          {(Array.isArray(musicians) ? musicians : []).map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={form.instrumentId}
          onChange={e => setForm(f => ({ ...f, instrumentId: e.target.value }))}
        >
          <option value="">Select instrument</option>
          {(Array.isArray(instruments) ? instruments : []).map(i => (
            <option key={i.id} value={i.id}>{i.displayName}</option>
          ))}
        </select>
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Public notes"
          value={form.publicNotes}
          onChange={e => setForm(f => ({ ...f, publicNotes: e.target.value }))}
        />
        <input
          className="border rounded px-2 py-1"
          type="text"
          placeholder="Private notes"
          value={form.privateNotes}
          onChange={e => setForm(f => ({ ...f, privateNotes: e.target.value }))}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          type="button"
          onClick={handleSubmit}
          disabled={loading}
        >{editing ? 'Update' : 'Add'}</button>
        {editing && (
          <button
            className="ml-2 text-gray-600 px-2 py-1 border rounded"
            type="button"
            onClick={() => { setEditing(null); setForm({ musicianId: '', instrumentId: '', publicNotes: '', privateNotes: '' }); }}
          >Cancel</button>
        )}
      </div>
    </section>
  );
};

export default EventMusiciansSection;
