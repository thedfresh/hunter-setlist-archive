import { getVenueBySlug } from '@/lib/queries/venueBrowseQueries';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateSlug } from '@/lib/eventSlug';

function getPerformerColorClass(name: string) {
  const n = name.toLowerCase();
  if (n.includes('roadhog')) return 'text-[#a67c00]';
  if (n.includes('comfort')) return 'text-[#4a6617]';
  if (n.includes('dinosaurs')) return 'text-[#0891b2]';
  if (n.includes('special')) return 'text-[#5a3d5c]';
  return 'text-[#8b6914]'; // solo
}

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

export default async function VenueDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const venue = await getVenueBySlug(slug);
  if (!venue) return notFound();

  type EventType = {
    id: number;
    year: number | null;
    month: number | null;
    day: number | null;
    displayDate: string | null;
    slug: string | null;
    verified: boolean;
    sortDate?: string | Date | null;
    primaryBand?: { name: string } | null;
  };

  const events: EventType[] = venue.events || [];
  const totalShows = events.length;
  const sortedEvents = [...events].sort((a, b) => {
    const aSort = a.sortDate ? (typeof a.sortDate === 'string' ? new Date(a.sortDate) : a.sortDate) : new Date(a.year || 0, (a.month || 1) - 1, a.day || 1);
    const bSort = b.sortDate ? (typeof b.sortDate === 'string' ? new Date(b.sortDate) : b.sortDate) : new Date(b.year || 0, (b.month || 1) - 1, b.day || 1);
    return aSort.getTime() - bSort.getTime();
  });
  const firstShow = sortedEvents[0];
  const lastShow = sortedEvents[sortedEvents.length - 1];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{venue.name}</h1>
        <div className="text-gray-700 mb-2">
          {venue.city}{venue.city && venue.stateProvince ? ', ' : ''}{venue.stateProvince}
        </div>
        {venue.publicNotes && (
          <div className="mb-4 text-sm text-gray-600 whitespace-pre-line">{venue.publicNotes}</div>
        )}
        <div className="flex gap-6 text-sm mb-2">
          <div>Total Shows: <strong>{totalShows}</strong></div>
          {firstShow && lastShow && (
            <div>Date Range: <span>{formatEventDate(firstShow)} – {formatEventDate(lastShow)}</span></div>
          )}
        </div>
        {venue.links && venue.links.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold text-sm mb-1">External Links:</div>
            <ul className="list-disc pl-5 text-sm">
              {venue.links.map((link: any) => (
                <li key={link.id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {link.title || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="card p-6">
        <div className="section-header mb-4">Shows at this Venue</div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Performer</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event: any) => (
                <tr key={event.id}>
                  <td>
                    <Link href={`/event/${event.slug || generateSlug(event)}`} className="link-internal">
                      {formatEventDate(event)}
                    </Link>
                  </td>
                  <td>
                    <span className={getPerformerColorClass(event.primaryBand?.name || 'Solo')}>
                      {event.primaryBand?.name || 'Solo'}
                    </span>
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
