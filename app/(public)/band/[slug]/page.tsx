import { getBandBySlug } from '@/lib/queries/bandBrowseQueries';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';
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

  // Simplified event sorting using sortDate
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = a.sortDate ? new Date(a.sortDate) : null;
    const bDate = b.sortDate ? new Date(b.sortDate) : null;
    if (!aDate || !bDate) return 0;
    return aDate.getTime() - bDate.getTime();
  });

  // First/last show using sortedEvents
  const firstShow = sortedEvents.length > 0 ? sortedEvents[0] : null;
  const lastShow = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1] : null;

  return (
    <PageContainer>
      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{band.name}</h1>
        {band.publicNotes && (
          <div className="mb-4 text-sm text-gray-600 whitespace-pre-line">{band.publicNotes}</div>
        )}
        <div className="flex gap-6 text-sm mb-2">
          <div>Total Shows: <strong>{totalShows}</strong></div>
          {firstShow && lastShow && (
            <div>Date Range: <span>{formatEventDate(firstShow)} – {formatEventDate(lastShow)}</span></div>
          )}
        </div>
      </div>
      {band.bandMusicians && band.bandMusicians.length > 0 && (
        <div className="card p-6 mb-6">
          <div className="section-header mb-4">Members</div>
          <ul className="list-disc pl-5 text-sm">
            {band.bandMusicians.map((bm: any) => (
              <li key={bm.musician.name}>
                <span className="font-semibold">{bm.musician.name}</span>
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
                {/* {bm.joinedDate && <span className="ml-2 text-gray-500">(Joined: {renderDate(bm.joinedDate)})</span>}
              {bm.leftDate && <span className="ml-2 text-gray-500">(Left: {renderDate(bm.leftDate)})</span>} */}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="card p-6">
        <div className="section-header mb-4">Shows</div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Venue</th>
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
                    {event.venue?.name}
                    {event.venue?.city ? `, ${event.venue.city}` : ''}
                    {event.venue?.stateProvince ? `, ${event.venue.stateProvince}` : ''}
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
