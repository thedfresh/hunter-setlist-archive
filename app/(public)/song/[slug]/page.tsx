import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { getSongWithPerformances } from '@/lib/queries/songQueries';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import SongPerformancesTable from '@/components/ui/events/SongPerformancesTable';
import ExternalLink from '@/components/ui/ExternalLink';
import Markdown from '@/components/ui/Markdown';
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
  // Default sort: chronological
  let sortedByDate = [...song.performances].sort((a: any, b: any) => {
    const aVal = a.set?.event;
    const bVal = b.set?.event;
    const aDate = aVal?.sortDate ? new Date(aVal.sortDate) : null;
    const bDate = bVal?.sortDate ? new Date(bVal.sortDate) : null;
    if (aDate && bDate && aDate.getTime() !== bDate.getTime()) return aDate.getTime() - bDate.getTime();
    if (a.set.position !== b.set.position) return a.set.position - b.set.position;
    return a.performanceOrder - b.performanceOrder;
  });

  // Sort state for Gap column (default: chronological)
  // Use search params for SSR compatibility
  const searchParams = (typeof window !== 'undefined' && window.location.search)
    ? new URLSearchParams(window.location.search)
    : null;
  let gapSort: 'asc' | 'desc' | null = null;
  if (searchParams && searchParams.get('sort') === 'gap') {
    gapSort = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  }
  if (gapSort) {
    sortedByDate = [...sortedByDate].sort((a: any, b: any) => {
      const gapA = a.gap ?? -1;
      const gapB = b.gap ?? -1;
      return gapSort === 'asc' ? gapA - gapB : gapB - gapA;
    });
  }
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
            </div>
          </section>

          {/* Lead Vocals Section */}
          {song.leadVocals && song.leadVocals.name &&
            !['hunter', 'robert hunter'].includes(song.leadVocals.name.trim().toLowerCase()) && (
              <section>
                <div className="font-semibold text-lg mb-2">Lead Vocals</div>
                <div className="text-sm text-gray-700 space-y-1">
                  {song.leadVocals.slug ? (
                    <Link href={`/musician/${song.leadVocals.slug}`} className="link-internal">
                      {song.leadVocals.name}
                    </Link>
                  ) : (
                    song.leadVocals.name
                  )}
                </div>
              </section>
            )}

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
              <ul className="space-y-1 text-sm">
                {song.links.map((link: any) => (
                  <li key={link.id}>
                    <ExternalLink href={link.url}>
                      {link.title || link.url}
                    </ExternalLink>
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
                <Markdown>
                  {song.publicNotes}
                </Markdown>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Full Width: All Performances */}
      <section>
        <div className="font-semibold text-lg mb-2">All Performances</div>
        <SongPerformancesTable performances={sortedByDate} />
      </section>
    </PageContainer>
  );
}
