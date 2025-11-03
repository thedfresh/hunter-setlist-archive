import { getBandBySlug } from '@/lib/queries/bandBrowseQueries';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import remarkGfm from 'remark-gfm';
import { formatEventDate } from '@/lib/formatters/dateFormatter';


export async function generateMetadata({ params }: { params: { slug: string } }) {
  const band = await getBandBySlug(params.slug);

  if (!band) {
    return {
      title: 'Band Not Found | Hunter Archive',
    };
  }

  const showCount = band.events?.length || 0;

  return {
    title: `${band.name} (${showCount} shows) | Hunter Archive`,
    description: `Performance history and setlists from ${band.name} featuring Robert Hunter`,
  };
}

export default async function BandDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const band = await getBandBySlug(slug);
  if (!band) return notFound();

  const events: any[] = band.events || [];
  const totalShows = events.length;
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = a.sortDate ? new Date(a.sortDate) : null;
    const bDate = b.sortDate ? new Date(b.sortDate) : null;
    if (!aDate || !bDate) return 0;
    return aDate.getTime() - bDate.getTime();
  });
  const firstShow = sortedEvents.length > 0 ? sortedEvents[0] : null;
  const lastShow = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1] : null;

  return (
    <PageContainer>
      <h1 className="page-title mb-8">{band.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8 mb-8">
        {/* LEFT COLUMN: Stats, Members */}
        <div className="pr-0 md:pr-4 md:border-r border-gray-200">
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg mb-2">Statistics</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Total Shows: <span className="font-medium">{totalShows}</span></div>
                {firstShow && lastShow && (
                  <div>Date: <span className="font-medium">{formatEventDate(firstShow)} – {formatEventDate(lastShow)}</span></div>
                )}
              </div>
            </div>
            {band.bandMusicians && band.bandMusicians.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-2">Band Members</h2>
                <div>
                  {band.bandMusicians.map((bm: any) => (
                    <div key={bm.musician.slug || bm.musician.name} className="text-sm mb-3">
                      <div>
                        {bm.musician?.slug ? (
                          <Link href={`/musician/${bm.musician.slug}`} className="link-internal">
                            {bm.musician.firstName && bm.musician.lastName
                              ? `${bm.musician.firstName} ${bm.musician.lastName}`
                              : bm.musician.name}
                          </Link>
                        ) : (
                          bm.musician.name
                        )}
                        {bm.musician.defaultInstruments && bm.musician.defaultInstruments.length > 0 && (
                          <span className="ml-2 text-gray-700">(
                            {bm.musician.defaultInstruments.map((di: any, idx: number) => (
                              <span key={di.instrument.displayName}>
                                {di.instrument.displayName}
                                {idx < bm.musician.defaultInstruments.length - 1 ? ", " : ""}
                              </span>
                            ))}
                            )</span>
                        )}
                      </div>
                      {(bm.joinedDate != null || bm.leftDate != null) && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {bm.joinedDate != null && (
                            <span>Joined: {new Date(bm.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                          )}
                          {bm.joinedDate != null && bm.leftDate != null && <span className="mx-2">•</span>}
                          {bm.leftDate != null && (
                            <span>Left: {new Date(bm.leftDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* RIGHT COLUMN: Notes */}
        <div>
          {band.publicNotes && (
            <div className="mb-8">
              <h2 className="font-semibold text-lg mb-2">Notes</h2>
              <div className="text-sm text-gray-600">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{band.publicNotes}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* FULL WIDTH: Performances Table */}
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-2">Performances</h2>
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Venue</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event: any) => (
                <tr key={event.id}>
                  <td>
                    <Link href={`/event/${event.slug}`} className="link-internal">
                      {formatEventDate(event)}
                    </Link>
                  </td>
                  <td>
                    {event.venue?.slug ? (
                      <Link href={`/venue/${event.venue.slug}`} className="link-internal">
                        {formatVenue(event.venue)}
                      </Link>
                    ) : (
                      event.venue && formatVenue(event.venue)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}
