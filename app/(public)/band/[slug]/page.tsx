import { getBandBySlug } from '@/lib/queries/bandBrowseQueries';
import { notFound } from 'next/navigation';
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

  const events = band.events || [];
  const totalShows = events.length;
  const sortedEvents = [...events].sort((a, b) => {
    const aDate = new Date(a.year || 0, (a.month || 1) - 1, a.day || 1);
    const bDate = new Date(b.year || 0, (b.month || 1) - 1, b.day || 1);
    return aDate.getTime() - bDate.getTime();
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
    <div className="max-w-3xl mx-auto p-6">
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
      <div className="card p-6 mb-6">
        <div className="section-header mb-4">Members</div>
        <ul className="list-disc pl-5 text-sm">
          {band.bandMusicians.map((bm: any) => (
            <li key={bm.musician.name}>
              <span className="font-semibold">{bm.musician.name}</span>
              {bm.joinedDate && <span className="ml-2 text-gray-500">(Joined: {renderDate(bm.joinedDate)})</span>}
              {bm.leftDate && <span className="ml-2 text-gray-500">(Left: {renderDate(bm.leftDate)})</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6">
        <div className="section-header mb-4">Shows</div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Venue</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event: any) => (
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
                  <td>
                    {event.verified && <span className="badge-verified">Verified</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
