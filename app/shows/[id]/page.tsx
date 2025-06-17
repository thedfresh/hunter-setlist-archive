import { pool } from '../../../lib/db';
import { notFound } from 'next/navigation';

interface Song {
  id: number;
  title: string;
  is_segued: boolean;
  performance_order: number;
}

interface Set {
  id: number;
  set_order: number;
  name: string | null;
  songs: Song[];
}

interface Recording {
  id: number;
  source: string;
  url: string;
}

interface Contributor {
  id: number;
  name: string;
  raw_contributor_string: string | null;
}

interface Show {
  id: number;
  year: number;
  month: number | null;
  day: number | null;
  date_full: string | null;
  venue_name: string;
  city: string | null;
  state_province: string | null;
  notes: string | null;
  sets: Set[];
  recordings: Recording[];
  contributors: Contributor[];
}

export default async function ShowDetailsPage({ params }: { params: { id: string } }) {
  const client = await pool.connect();
  const showId = parseInt(params.id, 10);

  // Fetch show details
  const showResult = await client.query(`
    SELECT 
      s.id, s.year, s.month, s.day, s.date_full, s.notes,
      v.name as venue_name, v.city, v.state_province,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', r.id, 'source', r.source, 'url', r.url)) FILTER (WHERE r.id IS NOT NULL), '[]') as recordings
    FROM shows s
    LEFT JOIN venues v ON s.venue_id = v.id
    LEFT JOIN recordings r ON r.show_id = s.id
    WHERE s.id = $1
    GROUP BY s.id, v.name, v.city, v.state_province
  `, [showId]);

  if (showResult.rows.length === 0) {
    client.release();
    return notFound();
  }

  // Fetch sets and performances for this show
  const setsResult = await client.query(`
    SELECT 
      sets.id as set_id, sets.set_order,
      performances.id as performance_id, performances.song_id, performances.performance_order, performances.is_segued,
      songs.title as song_title
    FROM sets
    LEFT JOIN performances ON performances.set_id = sets.id
    LEFT JOIN songs ON songs.id = performances.song_id
    WHERE sets.show_id = $1
    ORDER BY sets.set_order, performances.performance_order
  `, [showId]);

  // Fetch contributors for this show
  const contributorsResult = await client.query(`
    SELECT c.id, c.name, sc.raw_contributor_string
    FROM show_contributors sc
    JOIN contributors c ON sc.contributor_id = c.id
    WHERE sc.show_id = $1
    ORDER BY c.name
  `, [showId]);

  client.release();

  // Organize sets and songs
  const sets: Set[] = [];
  setsResult.rows.forEach((row: any) => {
    let set = sets.find((s) => s.id === row.set_id);
    if (!set) {
      set = {
        id: row.set_id,
        set_order: row.set_order,
        name: null, // No set name column
        songs: [],
      };
      sets.push(set);
    }
    if (row.performance_id && row.song_title) {
      set.songs.push({
        id: row.performance_id,
        title: row.song_title,
        is_segued: row.is_segued,
        performance_order: row.performance_order,
      });
    }
  });

  const row = showResult.rows[0];
  const show: Show = {
    id: row.id,
    year: row.year,
    month: row.month,
    day: row.day,
    date_full: row.date_full,
    venue_name: row.venue_name,
    city: row.city,
    state_province: row.state_province,
    notes: row.notes,
    sets,
    recordings: row.recordings,
    contributors: contributorsResult.rows,
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">
        {show.month && show.day ? `${show.month}/${show.day}/` : show.month ? `${show.month}/` : ''}{show.year}
      </h1>
      <div className="text-lg text-gray-700 mb-1">
        {show.venue_name} - {show.city}{show.state_province ? `, ${show.state_province}` : ''}
      </div>
      {show.notes && <div className="mb-2 text-blue-900 italic">{show.notes}</div>}
      {show.contributors.length > 0 && (
        <div className="mb-2 text-sm text-gray-600">
          Contributors: {show.contributors.map((c) => c.name).join(', ')}
        </div>
      )}
      {show.sets.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-1">Setlist</h2>
          {show.sets.map((set) => (
            <div key={set.id} className="mb-1">
              <span className="font-bold">{`Set ${set.set_order}`}: </span>
              {set.songs.map((song, idx) => (
                <span key={song.id}>
                  {song.title}
                  {idx < set.songs.length - 1 ? (song.is_segued ? ' > ' : ', ') : ''}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      {show.recordings.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-1">Recordings</h2>
          {show.recordings.map((rec: Recording) => (
            <a key={rec.id} href={rec.url} className="underline mr-2" target="_blank" rel="noopener noreferrer">{rec.source}</a>
          ))}
        </div>
      )}
    </main>
  );
}
