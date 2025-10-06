// Generate event slug from displayDate and showTiming (matches performance list logic)
function getEventSlug(event: any) {
  if (event.slug) return event.slug;
  let slug = '';
  if (event.displayDate) {
    slug = event.displayDate;
    if (event.showTiming) {
      slug += `-${event.showTiming.toLowerCase()}`;
    }
  } else if (event.year) {
    const mm = event.month ? String(event.month).padStart(2, '0') : 'unknown';
    const dd = event.day ? String(event.day).padStart(2, '0') : 'unknown';
    slug = `${event.year}-${mm}-${dd}`;
    if (event.showTiming) {
      slug += `-${event.showTiming.toLowerCase()}`;
    }
  } else {
    slug = String(event.id);
  }
  return slug;
}
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';


// Reverse the slug logic from the list page
function deslugify(slug: string) {
  // Replace hyphens with spaces, remove extra spaces, and title-case
  const cleaned = slug
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Title-case each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(event: any) {
  if (!event) return '';
  const { year, month, day } = event;
  if (!year) return '';
  const mm = month ? String(month).padStart(2, '0') : '??';
  const dd = day ? String(day).padStart(2, '0') : '??';
  return `${year}-${mm}-${dd}`;
}

export default async function SongDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const titleFromSlug = deslugify(slug);

  const song = await prisma.song.findFirst({
    where: { title: { equals: titleFromSlug, mode: 'insensitive' } },
    include: {
      songAlbums: { include: { album: true } },
      songTags: { include: { tag: true } },
      links: true,
      performances: {
        include: {
          set: {
            include: {
              event: {
                include: {
                  venue: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!song) return notFound();

  // Compute performance stats
  const filteredPerformances = song.performances.filter(
    (p: any) => !p.isMedley && p.set?.event?.includeInStats
  );
  const totalPerformed = filteredPerformances.length;
  const sortedByDate = [...filteredPerformances].sort((a: any, b: any) => {
    const aDate = new Date(a.set.event.year || 0, (a.set.event.month || 1) - 1, a.set.event.day || 1);
    const bDate = new Date(b.set.event.year || 0, (b.set.event.month || 1) - 1, b.set.event.day || 1);
    return aDate.getTime() - bDate.getTime();
  });
  const firstPerf = sortedByDate[0];
  const lastPerf = sortedByDate[sortedByDate.length - 1];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded shadow p-6">
        <div className="page-header mb-4">
          <h1 className="page-title text-2xl font-bold">{song.title}</h1>
          {song.alternateTitle && (
            <div className="text-gray-500 text-sm">({song.alternateTitle})</div>
          )}
        </div>
        {/* Metadata */}
        <section className="mb-6">
          <div className="section-header text-lg font-semibold mb-2">Metadata</div>
          <div className="text-sm text-gray-600 space-y-1">
            {song.lyricsBy && <div>Lyrics by: {song.lyricsBy}</div>}
            {song.musicBy && <div>Music by: {song.musicBy}</div>}
            {song.originalArtist && song.originalArtist.toLowerCase() !== 'hunter' && (
              <div>Original Artist: {song.originalArtist}</div>
            )}
            {song.songAlbums.length > 0 && (
              <div>
                Albums: {song.songAlbums.map((sa: any, i: number) => (
                  <span key={sa.album.id}>
                    <Link href={`/admin/albums/${sa.album.id}`} className="link-internal">
                      {sa.album.title}
                    </Link>
                    {i < song.songAlbums.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
        {/* Statistics */}
        <section className="mb-6">
          <div className="section-header text-lg font-semibold mb-2">Statistics</div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Times Performed: {totalPerformed}</div>
            <div>
              First Performance:{' '}
              {firstPerf ? (
                <Link href={`/event/${firstPerf.set.event.id}`} className="link-internal">
                  {formatDate(firstPerf.set.event)}
                </Link>
              ) : '—'}
            </div>
            <div>
              Last Performance:{' '}
              {lastPerf ? (
                <Link href={`/event/${lastPerf.set.event.id}`} className="link-internal">
                  {formatDate(lastPerf.set.event)}
                </Link>
              ) : '—'}
            </div>
          </div>
        </section>
        {/* Tags */}
        {song.songTags.length > 0 && (
          <section className="mb-6">
            <div className="section-header text-lg font-semibold mb-2">Tags</div>
            <div className="flex flex-wrap gap-2">
              {song.songTags.map((st: any) => (
                <span key={st.tag.id} className="bg-gray-200 rounded px-2 py-1 text-xs">
                  {st.tag.name}
                </span>
              ))}
            </div>
          </section>
        )}
        {/* Links */}
        {song.links.length > 0 && (
          <section className="mb-6">
            <div className="section-header text-lg font-semibold mb-2">Links</div>
            <ul className="list-disc pl-5 text-sm">
              {song.links.map((link: any) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {link.title || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        {/* Performances Table */}
        <section>
          <div className="section-header text-lg font-semibold mb-2">All Performances</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Venue</th>
                  <th className="px-2 py-1 text-left">Event</th>
                </tr>
              </thead>
              <tbody>
                {sortedByDate.map((perf: any) => (
                  <tr key={perf.id} className="border-t">
                    <td className="px-2 py-1">{formatDate(perf.set.event)}</td>
                    <td className="px-2 py-1">
                      {perf.set.event.venue ? (
                        <>
                          {perf.set.event.venue.name}
                          {perf.set.event.venue.context ? `, ${perf.set.event.venue.context}` : ''}
                          {perf.set.event.venue.city ? `, ${perf.set.event.venue.city}` : ''}
                          {perf.set.event.venue.stateProvince ? `, ${perf.set.event.venue.stateProvince}` : ''}
                          {perf.set.event.venue.country ? `, ${perf.set.event.venue.country}` : ''}
                        </>
                      ) : ''}
                    </td>
                    <td className="px-2 py-1">
                      <Link
                        href={`/event/${getEventSlug(perf.set.event)}`}
                        className="link-internal action-btn"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* No cap or pagination message needed */}
          </div>
        </section>
      </div>
    </div>
  );
}
