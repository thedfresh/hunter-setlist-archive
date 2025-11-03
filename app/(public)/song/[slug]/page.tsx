import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { getSongWithPerformances } from '@/lib/queries/songQueries';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import { ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const song = await getSongWithPerformances(params.slug);

  if (!song) {
    return {
      title: 'Song Not Found | Hunter Archive',
    };
  }

  // Count non-medley performances for stats
  const performanceCount = song.performances.filter((p: any) =>
    !p.isMedley && p.set?.event?.eventType?.includeInStats !== false
  ).length;

  const artist = song.originalArtist || 'Robert Hunter';

  return {
    title: `${song.title} (${performanceCount} performances) | Hunter Archive`,
    description: `Performance history and recordings of "${song.title}"}.`,
  };
}

export default async function SongDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Use reusable query function
  const song = await getSongWithPerformances(slug);

  if (!song) return notFound();

  // Compute performance stats
  // For stats, filter out medleys only (query already filters by event type)
  const filteredPerformances = song.performances.filter((p: any) =>
    p.set?.event?.eventType?.includeInStats !== false
  );
  // Count distinct events (not performance rows)
  const uniqueEventIds = new Set(
    song.performances
      .filter((p: any) => p.set?.event?.eventType?.includeInStats !== false)
      .map((p: any) => p.set.event.id)
  );
  const totalPerformed = uniqueEventIds.size;
  // For display, include all performances, but sort by event date and set order
  const sortedByDate = [...song.performances].sort((a: any, b: any) => {
    const aVal = a.set?.event;
    const bVal = b.set?.event;
    const aDate = aVal?.sortDate ? new Date(aVal.sortDate) : null;
    const bDate = bVal?.sortDate ? new Date(bVal.sortDate) : null;
    if (aDate && bDate && aDate.getTime() !== bDate.getTime()) return aDate.getTime() - bDate.getTime();
    if (a.set.position !== b.set.position) return a.set.position - b.set.position;
    return a.performanceOrder - b.performanceOrder;
  });
  const firstPerf = sortedByDate.length > 0 ? sortedByDate[0] : undefined;
  const lastPerf = sortedByDate.length > 0 ? sortedByDate[sortedByDate.length - 1] : undefined;

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
        {song.alternateTitle && (
          <div className="text-xl text-gray-600">{song.alternateTitle}</div>
        )}
      </div>

      {/* Two Column Layout: 20/80 split */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8 mb-8">

        {/* LEFT COLUMN - Data (20%) */}
        <div className="space-y-6 pr-0 md:pr-8 md:border-r border-gray-200">

          {/* Statistics */}
          <section>
            <div className="font-semibold text-lg mb-2">Statistics</div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Times Performed: {totalPerformed}</div>
              <div>
                First Performance:{' '}
                {firstPerf ? (
                  <Link href={`/event/${firstPerf.set.event.slug}`} className="link-internal">
                    {formatEventDate(firstPerf.set.event)}
                  </Link>
                ) : '—'}
              </div>
              <div>
                Last Performance:{' '}
                {lastPerf ? (
                  <Link href={`/event/${lastPerf.set.event.slug}`} className="link-internal">
                    {formatEventDate(lastPerf.set.event)}
                  </Link>
                ) : '—'}
              </div>
            </div>
          </section>



          {/* Original Artist (if cover) */}
          {song.originalArtist && song.originalArtist.toLowerCase() !== 'hunter' && (
            <section>
              <div className="font-semibold text-lg mb-2">Original Artist</div>
              <div className="text-sm text-gray-700 space-y-1">{song.originalArtist}</div>
            </section>
          )}

          {/* Credits */}
          <section>
            <div className="font-semibold text-lg mb-2">Credits</div>
            <div className="text-sm text-gray-700 space-y-1">
              {song.songBy && <div>Written by: {song.songBy}</div>}
              {!song.songBy && song.lyricsBy && <div>Lyrics by: {song.lyricsBy}</div>}
              {!song.songBy && song.musicBy && <div>Music by: {song.musicBy}</div>}
              {song.leadVocals && song.leadVocals.name !== 'Robert Hunter' && (
                <div>Lead vocals: {song.leadVocals.name}</div>
              )}
            </div>
          </section>

          {/* Variants Section */}
          {(song.parentSong || (song.variants && song.variants.length > 0)) && (
            <section>
              <div className="font-semibold text-lg mb-2">
                {song.parentSong ? 'Variant' : 'Other Versions'}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                {song.parentSong && (
                  <>
                    {song.arrangement && (
                      <div>Arrangement: {song.arrangement}</div>
                    )}
                    <div>
                      Canonical version: <Link href={`/song/${song.parentSong.slug}`} className="link-internal">
                        {song.parentSong.title}
                      </Link>
                    </div>
                  </>
                )}
                {song.variants && song.variants.length > 0 && (
                  <div>
                    Other arrangements:
                    <ul className="ml-4 mt-1 space-y-1">
                      {song.variants.map((variant: any) => (
                        <li key={variant.id}>
                          <Link href={`/song/${variant.slug}`} className="link-internal">
                            {variant.arrangement || 'Unnamed variant'}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
          {/* Links */}
          {song.links && song.links.length > 0 && (
            <section>
              <div className="font-semibold text-lg mb-2">Links</div>
              <ul className="space-y-1">
                {song.links.map((link: any) => (
                  <li key={link.id}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:text-blue-800">
                      {link.title || link.url}
                      <ExternalLink size={14} className="flex-shrink-0" />
                    </a>
                    {/* {link.linkType && (
                      <span className="text-xs text-gray-500 ml-1">({link.linkType.name})</span>
                    )} */}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Tags */}
          {song.songTags.length > 0 && (
            <section>
              <div className="font-semibold text-lg mb-2">Tags</div>
              <div className="flex flex-wrap gap-2">
                {song.songTags.map((st: any) => (
                  <span key={st.tag.id} className="bg-gray-200 rounded px-2 py-1 text-xs">
                    {st.tag.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN - Notes & Links (80%) */}
        <div className="space-y-6">
          {/* Notes */}
          {song.publicNotes && (
            <section>
              <div className="font-semibold text-lg mb-2">Notes</div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {song.publicNotes}
                </ReactMarkdown>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Full Width: All Performances */}
      <section>
        <div className="font-semibold text-lg mb-2">All Performances</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
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
                const setPerformances = perf.set.performances
                  ? [...perf.set.performances].sort((a: any, b: any) => a.performanceOrder - b.performanceOrder)
                  : [];
                const perfIdx = setPerformances.findIndex((p: any) => p.id === perf.id);
                const prevPerf = perfIdx > 0 ? setPerformances[perfIdx - 1] : null;
                const nextPerf = perfIdx >= 0 && perfIdx < setPerformances.length - 1 ? setPerformances[perfIdx + 1] : null;

                let showDateVenue = true;
                if (idx > 0) {
                  const prev = arr[idx - 1];
                  // Hide if same event as previous performance
                  if (prev.set.event.id === perf.set.event.id) {
                    showDateVenue = false;
                  }
                }

                const isNonCountable = perf.set.event.eventType && perf.set.event.eventType.includeInStats === false;

                return (
                  <tr key={perf.id} className="border-t">
                    <td className="px-2 py-1">
                      {showDateVenue ? (
                        <Link href={`/event/${perf.set.event.slug}`} className="link-internal">
                          {formatEventDate(perf.set.event)}
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
                            {formatVenue(perf.set.event.venue)}
                          </Link>
                        ) : (
                          <span>{formatVenue(perf.set.event.venue)}</span>
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
        </div>
      </section>
    </PageContainer>
  );
}
