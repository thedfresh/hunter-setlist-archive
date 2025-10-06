import { getEventsBrowse } from '@/lib/queries/eventBrowseQueries';
import Link from 'next/link';
import { generateSlug } from '@/lib/eventSlug';

function formatEventDate(event: any) {
  let date = '';
  if (event.displayDate) date = event.displayDate;
  else if (event.year && event.month && event.day) {
    const mm = String(event.month).padStart(2, '0');
    const dd = String(event.day).padStart(2, '0');
    date = `${event.year}-${mm}-${dd}`;
  } else if (event.year) date = String(event.year);
  if (event.showTiming && (event.showTiming.toLowerCase() === 'early' || event.showTiming.toLowerCase() === 'late')) {
    date += ` (${event.showTiming.charAt(0).toUpperCase() + event.showTiming.slice(1).toLowerCase()})`;
  }
  return date;
}

function getPerformerName(event: any) {
  return event.primaryBand?.name || 'Solo';
}

function getCardClass(event: any) {
  const name = getPerformerName(event).toLowerCase();
  if (name.includes('roadhog')) return 'event-card-roadhog';
  if (name.includes('comfort')) return 'event-card-comfort';
  if (name.includes('dinosaurs')) return 'event-card-dinosaurs';
  if (name.includes('special')) return 'event-card-special';
  return 'event-card-solo';
}

function Setlist({ sets }: { sets: any[] }) {
  return (
    <div className="text-sm leading-loose text-gray-700 setlist space-y-2">
      {sets.map((set, i) => (
        <div key={set.id} className="space-y-2">
          <span className="font-semibold">{set.setType?.displayName || `Set ${i + 1}`}:</span>{' '}
          {set.performances.map((perf: any, idx: number) => (
            <span key={perf.id}>
              {perf.song?.title ? perf.song.title : '—'}
              {perf.seguesInto ? ' > ' : (idx < set.performances.length - 1 ? ', ' : '')}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pageLinks = [];
  for (let i = 1; i <= totalPages; i++) {
    pageLinks.push(
      <Link
        key={i}
        href={`?page=${i}`}
        className={`page-link${i === currentPage ? ' page-link-active' : ''}`}
      >
        {i}
      </Link>
    );
  }
  return (
    <div className="pagination mt-6 flex gap-2 items-center justify-center">
      <Link href={`?page=${currentPage - 1}`} className="page-link" aria-disabled={currentPage === 1} tabIndex={currentPage === 1 ? -1 : 0}>
        Previous
      </Link>
      {pageLinks}
      <Link href={`?page=${currentPage + 1}`} className="page-link" aria-disabled={currentPage === totalPages} tabIndex={currentPage === totalPages ? -1 : 0}>
        Next
      </Link>
    </div>
  );
}

export default async function EventBrowsePage({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams?.page || '1', 10) || 1;
  const { events, totalCount, currentPage, totalPages, pageSize } = await getEventsBrowse({ page });

  // Color legend for each artist
  const legend = [
    { label: 'Solo', className: 'event-card-solo' },
    { label: 'Roadhog', className: 'event-card-roadhog' },
    { label: 'Comfort', className: 'event-card-comfort' },
    { label: 'Dinosaurs', className: 'event-card-dinosaurs' },
    { label: 'Special', className: 'event-card-special' },
  ];

  return (
  <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Browse Events</h1>
      <div className="flex gap-3 mb-8">
        {legend.map(l => (
          <div key={l.label} className={`card ${l.className} px-3 py-1 text-xs font-semibold`}>{l.label}</div>
        ))}
      </div>
  <div className="grid grid-cols-1 gap-4">
        {events.map((event: any) => (
          <Link
            key={event.id}
            href={`/event/${generateSlug(event)}`}
            className={`event-card ${getCardClass(event)} block p-6`}
          >
            <div className="mb-4">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span>{formatEventDate(event)}</span>
                <span className="text-gray-700 text-base font-normal">{event.venue?.name}{event.venue?.city ? `, ${event.venue.city}` : ''}{event.venue?.stateProvince ? `, ${event.venue.stateProvince}` : ''}</span>
              </div>
            </div>
            <div className="space-y-4">
              <Setlist sets={event.sets} />
            </div>
          </Link>
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
