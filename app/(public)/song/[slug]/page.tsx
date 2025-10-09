import { prisma } from '@/lib/prisma';
import { getBrowsableEventsWhere } from '@/lib/queryFilters';
import { getCountablePerformancesWhere } from '@/lib/queryFilters';
import { notFound } from 'next/navigation';
import Link from 'next/link';



function formatDate(event: any) {
  if (!event) return '';
  const { year, month, day } = event;
  if (!year) return '';
  const mm = month ? String(month).padStart(2, '0') : '??';
  const dd = day ? String(day).padStart(2, '0') : '??';
  let timing = '';
  if (event?.showTiming?.toLowerCase() === 'early') timing = ' (Early)';
  else if (event?.showTiming?.toLowerCase() === 'late') timing = ' (Late)';
  return `${year}-${mm}-${dd}${timing}`;
}

export default async function SongDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const song = await prisma.song.findFirst({
    where: { slug },
    include: {
      songAlbums: { include: { album: true } },
      songTags: { include: { tag: true } },
      links: true,
      performances: {
        where: getCountablePerformancesWhere(),
        include: {
          set: {
            include: {
              event: {
                select: {
                  id: true,
                  slug: true,
                  year: true,
                  month: true,
                  day: true,
                  displayDate: true,
                  showTiming: true,
                  eventType: { select: { name: true, includeInStats: true } },
                  venue: {
                    select: {
                      id: true,
                      slug: true,
                      name: true,
                      context: true,
                      city: true,
                      stateProvince: true,
                      country: true,
                    },
                  },
                },
              },
              performances: {
                include: {
                  song: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Separate query for performance date list (includes studios/errata)
  const performanceDates = await prisma.performance.findMany({
    where: {
      song: { slug },
      set: {
        event: getBrowsableEventsWhere(),
      },
      isMedley: false,
    },
    include: {
      set: {
        include: {
          event: {
            select: {
              id: true,
              slug: true,
              year: true,
              month: true,
              day: true,
              displayDate: true,
              showTiming: true,
              eventType: { select: { name: true, includeInStats: true } },
              venue: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  context: true,
                  city: true,
                  stateProvince: true,
                  country: true,
                },
              },
            },
          },
          performances: {
            include: {
              song: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                }
              }
            },
            orderBy: { performanceOrder: 'asc' }
          }
        },
      },
    },
  });

  if (!song) return notFound();

  // Compute performance stats
  // For stats, filter out medleys only (query already filters by event type)
  const filteredPerformances = song.performances.filter(
    (p: any) => !p.isMedley
  );
  const totalPerformed = filteredPerformances.length;
  // For display, include all performances, but sort by event date and set order
  const sortedByDate = [...performanceDates].sort((a: any, b: any) => {
    const aDate = new Date(a.set.event.year || 0, (a.set.event.month || 1) - 1, a.set.event.day || 1);
    const bDate = new Date(b.set.event.year || 0, (b.set.event.month || 1) - 1, b.set.event.day || 1);
    if (aDate.getTime() !== bDate.getTime()) return aDate.getTime() - bDate.getTime();
    // If same event, order by set position and performanceOrder
    if (a.set.position !== b.set.position) return a.set.position - b.set.position;
    return a.performanceOrder - b.performanceOrder;
  });
  const firstPerf = filteredPerformances.length > 0 ? sortedByDate.find((p: any) => !p.isMedley) : undefined;
  const lastPerf = filteredPerformances.length > 0 ? [...sortedByDate].reverse().find((p: any) => !p.isMedley) : undefined;

  return (
    <div className="max-w-6xl mx-auto p-6">
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
                    <Link href={`/admin/albums/${sa.album.slug}`} className="link-internal">
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
                <Link href={`/event/${firstPerf.set.event.slug}`} className="link-internal">
                  {formatDate(firstPerf.set.event)}
                </Link>
              ) : '—'}
            </div>
            <div>
              Last Performance:{' '}
              {lastPerf ? (
                <Link href={`/event/${lastPerf.set.event.slug}`} className="link-internal">
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
            <table className="min-w-[900px] text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 text-left">Date</th>
                  <th className="px-2 py-1 text-left">Venue</th>
                  <th className="px-2 py-1 text-left">Previous Song</th>
                  <th className="px-2 py-1 text-left">Next Song</th>
                </tr>
              </thead>
              <tbody>
                {sortedByDate.map((perf: any, idx: number, arr: any[]) => {
                  // Find all performances in this set, sorted by performanceOrder
                  const setPerformances = perf.set.performances
                    ? [...perf.set.performances].sort((a: any, b: any) => a.performanceOrder - b.performanceOrder)
                    : [];
                  // Find this performance's index in its set
                  const perfIdx = setPerformances.findIndex((p: any) => p.id === perf.id);
                  const prevPerf = perfIdx > 0 ? setPerformances[perfIdx - 1] : null;
                  const nextPerf = perfIdx >= 0 && perfIdx < setPerformances.length - 1 ? setPerformances[perfIdx + 1] : null;
                  // Only show date/venue for non-medley, and only for the first occurrence for that event/set
                  let showDateVenue = true;
                  if (perf.isMedley) {
                    showDateVenue = false;
                  } else if (idx > 0) {
                    const prev = arr[idx - 1];
                    if (
                      prev.set.event.id === perf.set.event.id &&
                      prev.set.id === perf.set.id &&
                      !prev.isMedley
                    ) {
                      showDateVenue = false;
                    }
                  }
                  // Add indicator for studio/errata events
                  const isNonCountable = perf.set.event.eventType && perf.set.event.eventType.includeInStats === false;
                  return (
                    <tr key={perf.id} className="border-t">
                      <td className="px-2 py-1">
                        {showDateVenue ? (
                          <Link href={`/event/${perf.set.event.slug}`} className="link-internal">
                            {formatDate(perf.set.event)}
                          </Link>
                        ) : ''}
                        {showDateVenue && isNonCountable && (
                          <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold align-middle">Studio</span>
                        )}
                      </td>
                      <td className="px-2 py-1">
                        {showDateVenue && perf.set.event.venue ? (
                          perf.set.event.venue.slug ? (
                            <Link href={`/venue/${perf.set.event.venue.slug}`} className="link-internal">
                              {perf.set.event.venue.name}
                              {perf.set.event.venue.context ? `, ${perf.set.event.venue.context}` : ''}
                              {perf.set.event.venue.city ? `, ${perf.set.event.venue.city}` : ''}
                              {perf.set.event.venue.stateProvince ? `, ${perf.set.event.venue.stateProvince}` : ''}
                              {perf.set.event.venue.country ? `, ${perf.set.event.venue.country}` : ''}
                            </Link>
                          ) : (
                            <span>
                              {perf.set.event.venue.name}
                              {perf.set.event.venue.context ? `, ${perf.set.event.venue.context}` : ''}
                              {perf.set.event.venue.city ? `, ${perf.set.event.venue.city}` : ''}
                              {perf.set.event.venue.stateProvince ? `, ${perf.set.event.venue.stateProvince}` : ''}
                              {perf.set.event.venue.country ? `, ${perf.set.event.venue.country}` : ''}
                            </span>
                          )
                        ) : ''}
                      </td>
                      <td className="px-2 py-1">
                        {prevPerf ? (
                          <>
                            {prevPerf.isTruncatedEnd && <span className="text-xs text-gray-500">…</span>}
                            {prevPerf.song?.slug ? (
                              <Link href={`/song/${prevPerf.song.slug}`} className="link-internal">
                                {prevPerf.song.title}
                              </Link>
                            ) : (prevPerf.song?.title || '—')}
                            {prevPerf.seguesInto && <span className="text-gray-500"> &gt; </span>}
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-2 py-1">
                        {nextPerf ? (
                          <>
                            {perf.isTruncatedStart && <span className="text-xs text-gray-500">…</span>}
                            {perf.seguesInto && <span className="text-gray-500">&gt; </span>}
                            {nextPerf.song?.slug ? (
                              <Link href={`/song/${nextPerf.song.slug}`} className="link-internal">
                                {nextPerf.song.title}
                              </Link>
                            ) : (nextPerf.song?.title || '—')}
                          </>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* No cap or pagination message needed */}
          </div>
        </section>
      </div>
    </div>
  );
}
