import Link from 'next/link';
import { pool } from '../../lib/db';

interface Song {
  id: number;
  title: string;
  is_segued: boolean;
  performance_order: number;
  notes?: string | null;
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
}

export default async function ShowsPage() {
  const client = await pool.connect();

  // Fetch all shows with venue, notes, and recordings
  const showsResult = await client.query(`
    SELECT 
      s.id, s.year, s.month, s.day, s.date_full, s.notes,
      v.name as venue_name, v.city, v.state_province,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', r.id, 'source', r.source, 'url', r.url)) FILTER (WHERE r.id IS NOT NULL), '[]') as recordings
    FROM shows s
    LEFT JOIN venues v ON s.venue_id = v.id
    LEFT JOIN recordings r ON r.show_id = s.id
    GROUP BY s.id, v.name, v.city, v.state_province
    ORDER BY s.year ASC, s.month ASC NULLS FIRST, s.day ASC NULLS FIRST
  `);

  const showIds = showsResult.rows.map((row: any) => row.id);

  // Fetch sets and performances for all shows
  const setsResult = await client.query(`
    SELECT 
      sets.id as set_id, sets.show_id, sets.set_order,
      performances.id as performance_id, performances.song_id, performances.performance_order, performances.is_segued,
      performances.notes as notes,
      songs.title as song_title
    FROM sets
    LEFT JOIN performances ON performances.set_id = sets.id
    LEFT JOIN songs ON songs.id = performances.song_id
    WHERE sets.show_id = ANY($1)
    ORDER BY sets.show_id, sets.set_order, performances.performance_order
  `, [showIds]);

  client.release();

  // Organize sets and songs by show
  const setsByShow: Record<number, Set[]> = {};
  setsResult.rows.forEach((row: any) => {
    if (!setsByShow[row.show_id]) setsByShow[row.show_id] = [];
    let set = setsByShow[row.show_id].find((s) => s.id === row.set_id);
    if (!set) {
      set = {
        id: row.set_id,
        set_order: row.set_order,
        name: null, // No set name column
        songs: [],
      };
      setsByShow[row.show_id].push(set);
    }
    // When building set.songs, include notes from row.notes if available
    if (row.performance_id && row.song_title) {
      set.songs.push({
        id: row.performance_id,
        title: row.song_title,
        is_segued: row.is_segued,
        performance_order: row.performance_order,
        notes: row.notes || null,
      });
    }
  });

  // Build shows array with sets and recordings
  const shows: Show[] = showsResult.rows.map((row: any) => ({
    id: row.id,
    year: row.year,
    month: row.month,
    day: row.day,
    date_full: row.date_full,
    venue_name: row.venue_name,
    city: row.city,
    state_province: row.state_province,
    notes: row.notes,
    sets: setsByShow[row.id] || [],
    recordings: row.recordings,
  }));

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Robert Hunter Setlists</h1>
      <div className="space-y-6">
        {shows.map((show) => (
          <div key={show.id} className="border p-4 rounded">
            <div className="font-semibold">
              <Link href={`/shows/${show.id}`} className="underline hover:text-blue-700">
                {show.month && show.day ? `${show.month}/${show.day}/` : show.month ? `${show.month}/` : ''}{show.year}
              </Link>
            </div>
            <div className="text-gray-600">
              {show.venue_name} - {show.city}{show.state_province ? `, ${show.state_province}` : ''}
            </div>
            {show.notes && (
              <div className="mt-2 text-sm text-blue-900 italic">{show.notes}</div>
            )}
            {show.sets.length > 0 && (
              <div className="mt-2">
                {show.sets.map((set) => (
                  <div key={set.id} className="mb-1">
                    <span className="font-bold">{`Set ${set.set_order}`}: </span>
                    {set.songs.map((song, idx) => (
                      <span key={song.id}>
                        {song.title}{song.notes ? '*' : ''}
                        {idx < set.songs.length - 1 ? (song.is_segued ? ' > ' : ', ') : ''}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {show.recordings.length > 0 && (
              <div className="mt-2 text-sm">
                <span className="font-bold">Recordings: </span>
                {show.recordings.map((rec: Recording) => (
                  <a key={rec.id} href={rec.url} className="underline mr-2" target="_blank" rel="noopener noreferrer">{rec.source}</a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
