import { getBandBySlug } from '@/lib/queries/bandBrowseQueries';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';

function formatEventDate(event: any) {
  if (event.displayDate) return event.displayDate;
  if (event.year && event.month && event.day) {
    const mm = String(event.month).padStart(2, '0');
    const dd = String(event.day).padStart(2, '0');
    return `${event.year}-${mm}-${dd}`;
  }
  if (event.year) return String(event.year);
  return '';
}

export default async function BandDetailPage(props: { params: { slug: string } }) {
  const params = await Promise.resolve(props.params); // Ensure params is awaited for Next.js
  const { slug } = params;
  const band = await getBandBySlug(slug);
  if (!band) return notFound();

  type EventType = {
    id: number;
    year: number | null;
    month: number | null;
    day: number | null;
    displayDate: string | null;
    slug: string | null;
    verified: boolean;
    sortDate?: string | Date | null;
    venue?: { name: string; city?: string | null; stateProvince?: string | null } | null;
  };

  const events: EventType[] = band.events || [];
  const totalShows = events.length;
  // Sort by sortDate if available, fallback to year/month/day
  const sortedEvents = [...events].sort((a, b) => {
    const aSort = a.sortDate ? (typeof a.sortDate === 'string' ? new Date(a.sortDate) : a.sortDate) : new Date(a.year || 0, (a.month || 1) - 1, a.day || 1);
    const bSort = b.sortDate ? (typeof b.sortDate === 'string' ? new Date(b.sortDate) : b.sortDate) : new Date(b.year || 0, (b.month || 1) - 1, b.day || 1);
    return aSort.getTime() - bSort.getTime(); // ascending: earliest to latest
  });
  const firstShow = sortedEvents[0];
  const lastShow = sortedEvents[sortedEvents.length - 1];

  function renderDate(val: any) {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    return String(val);
  }

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
