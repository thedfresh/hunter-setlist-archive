function Setlist({ sets }: { sets: any[] }) {
  if (!sets || sets.length === 0) return null;
  return (
    <div className="text-sm leading-loose text-gray-700 setlist space-y-2 mt-2">
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

import { getEventsOnThisDate } from '@/lib/queries/eventBrowseQueries';
import Link from 'next/link';

function formatEventDate(event: any) {
  let date = '';
  if (event.displayDate) date = event.displayDate;
  else if (event.year && event.month && event.day) {
    const mm = String(event.month).padStart(2, '0');
    const dd = String(event.day).padStart(2, '0');
    date = `${event.year}-${mm}-${dd}`;
  } else if (event.year) date = String(event.year);
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

export default async function BetaHomePage() {
  const events = await getEventsOnThisDate();
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'long' });
  const day = today.getDate();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-4  text-center">Robert Hunter Setlist Archive 2.0 (Beta)</h1>
        <p className="text-sm text-gray-700 mb-2">
            Hello, and welcome to the resurrected Robert Hunter Setlist Archive!  I originaly built this site in the late '90s as a way to 
            document and share Hunter setlists from circulating tapes and contemporary tours.  I stopped updating the site after his 1998 tour,
            and by the mid-2000s the site was no longer online.  In 2025 I developed a plan to rebuild and modernize the site, this time 
            leveraging modern technology to create a searchable database of known performances.</p> 
        <p className="text-sm text-gray-700 mb-2">There is still a tremendous amount of work 
            to do - corrections, additions, new recordings and sources - but I hope this early version of the site is a useful resource and a good start.  If you have information, recordings, or corrections to contribute, please email me at <a href="mailto:dfresh@gmail.com" className="link-internal">dfresh@gmail.com</a>.  Enjoy exploring the legacy of Robert Hunter!
        </p>
        <p className="text-sm text-gray-700"> 
        </p>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Today in Hunter History</h2>
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No shows on this date in history</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((event: any) => (
              <Link
                key={event.id}
                href={`/event/${event.slug}`}
                className={`event-card ${getCardClass(event)} block py-3 px-6`}
              >
                <div className="mb-1 text-base font-semibold text-gray-700">{getPerformerName(event)}</div>
                <div className="mb-2 flex items-center gap-3 text-lg font-semibold">
                  <span>{formatEventDate(event)}
                    {event.showTiming && (['early','late'].includes(event.showTiming.toLowerCase())) && (
                      <span> ({event.showTiming.charAt(0).toUpperCase() + event.showTiming.slice(1).toLowerCase()})</span>
                    )}
                  </span>
                  <span className="text-gray-700 text-base font-normal">
                    {event.venue?.name}
                    {event.venue?.city ? `, ${event.venue.city}` : ''}
                    {event.venue?.stateProvince ? `, ${event.venue.stateProvince}` : ''}
                  </span>
                </div>
                <Setlist sets={event.sets} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
