import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { getSongWithPerformances } from '@/lib/queries/songQueries';
import SongPerformancesTable from '@/components/ui/events/SongPerformancesTable';
import ExternalLink from '@/components/ui/ExternalLink';
import Markdown from '@/components/ui/Markdown';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const song = await getSongWithPerformances(params.slug);

  if (!song) {
    return {
      title: 'Song Not Found | Hunter Archive',
    };
  }

  const performanceCount = song.performances.filter((p: any) =>
    !p.isMedley && p.set?.event?.eventType?.includeInStats !== false
  ).length;

  return {
    title: `${song.title} (${performanceCount} performances) | Hunter Archive`,
    description: `Performance history and recordings of "${song.title}".`,
  };
}

export default async function SongDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const song = await getSongWithPerformances(slug);

  if (!song) return notFound();

  // Compute stats
  const uniqueEventIds = new Set(
    song.performances
      .filter((p: any) => p.set?.event?.eventType?.includeInStats !== false)
      .map((p: any) => p.set.event.id)
  );
  const totalPerformed = uniqueEventIds.size;

  let sortedByDate = [...song.performances].sort((a: any, b: any) => {
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
    <>
      {/* Full-Width Page Header */}
      <div className="page-header-styled">
        <h1>{song.title}</h1>
        {song.alternateTitle && (
          <div className="subtitle">{song.alternateTitle}</div>
        )}
      </div>

      {/* Page Content */}
      <PageContainer variant="detail">

        {/* Sidebar + Content Layout */}
        <div className="detail-layout-sidebar">

          {/* LEFT SIDEBAR */}
          <aside className="detail-sidebar">

            <section className="detail-sidebar-section">
              <h3>Statistics</h3>
              <div className="stat-list">
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

            {song.originalArtist && song.originalArtist.toLowerCase() !== 'hunter' && (
              <section className="detail-sidebar-section">
                <h3>Original Artist</h3>
                <div className="stat-list">{song.originalArtist}</div>
              </section>
            )}

            <section className="detail-sidebar-section">
              <h3>Credits</h3>
              <div className="stat-list">
                {song.songBy && <div>Written by: {song.songBy}</div>}
                {!song.songBy && song.lyricsBy && <div>Lyrics by: {song.lyricsBy}</div>}
                {!song.songBy && song.musicBy && <div>Music by: {song.musicBy}</div>}
              </div>
            </section>

            {song.leadVocals && song.leadVocals.name &&
              !['hunter', 'robert hunter'].includes(song.leadVocals.name.trim().toLowerCase()) && (
                <section className="detail-sidebar-section">
                  <h3>Lead Vocals</h3>
                  <div className="stat-list">
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

            {(song.parentSong || (song.variants && song.variants.length > 0)) && (
              <section className="detail-sidebar-section">
                <h3>{song.parentSong ? 'Variant' : 'Other Versions'}</h3>
                <div className="stat-list">
                  {song.parentSong && (
                    <>
                      {song.arrangement && <div>Arrangement: {song.arrangement}</div>}
                      <div>
                        Canonical:{' '}
                        <Link href={`/song/${song.parentSong.slug}`} className="link-internal">
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

            {song.links && song.links.length > 0 && (
              <section className="detail-sidebar-section">
                <h3>Links</h3>
                <div className="link-list">
                  {song.links.map((link: any) => (
                    <div key={link.id}>
                      <ExternalLink href={link.url}>
                        {link.title || link.url}
                      </ExternalLink>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {song.songTags.length > 0 && (
              <section className="detail-sidebar-section">
                <h3>Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {song.songTags.map((st: any) => (
                    <span key={st.tag.id} className="bg-gray-200 rounded px-2 py-1 text-xs">
                      {st.tag.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </aside>

          {/* MAIN CONTENT */}
          <main className="detail-content">
            {song.publicNotes && (
              <section className="detail-content-section">
                <h2>Notes</h2>
                <div className="prose prose-sm max-w-none">
                  <Markdown>{song.publicNotes}</Markdown>
                </div>
              </section>
            )}
          </main>
        </div>

        {/* Full Width: Performances Table */}
        <section className="detail-layout-full">
          <h2>All Performances</h2>
          <p className="text-sm text-gray-600 mb-4">
            "Gap" is the count of shows with known setlists between performances, excluding studio sessions and guest appearances.
          </p>
          <SongPerformancesTable performances={sortedByDate} />
        </section>
      </PageContainer>
    </>
  );
}