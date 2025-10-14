'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Setlist from '@/components/ui/events/Setlist';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { getPerformerCardClass } from '@/lib/utils/performerStyles';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PageContainer } from '@/components/ui/PageContainer';

function getEventDisplayDate(e: any) {
  return e.displayDate || formatEventDate(e);
}

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    fetch(`/api/events/on-date?month=${month}&day=${day}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || []);
        setLoading(false);
      });
  }, []);

  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const dayNum = today.getDate();

  if (loading) {
    return (
      <PageContainer variant="text">
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="text">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-4  text-center">Robert Hunter Performance Archive 2.0</h1>
        <p className="text-sm text-gray-700 mb-2">
          Hello, and welcome to the resurrected Robert Hunter Performance Archive!  I originaly built this site in the late '90s as a way to
          document and share Hunter performances from circulating tapes and contemporary tours.  I stopped updating the site after his 1998 tour,
          and by the mid-2000s the site was no longer online.  In 2025 I developed a plan to rebuild and modernize the site
          leveraging modern technology to create a searchable database of known performances.</p>
        <p className="text-sm text-gray-700 mb-2">There is still a tremendous amount of work
          to do - corrections, additions, new recordings and sources - but I hope this early version of the site is a useful resource and a
          good start.  If you have information, recordings, or corrections to contribute, please email me at
          <a href="mailto:dfresh@gmail.com" className="link-internal">dfresh@gmail.com</a>.  Enjoy exploring the legacy of Robert Hunter!
        </p>
        <div className="card mt-6 px-6 py-4 bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Get Updates!</h3>
          <p className="text-sm text-gray-700 mb-2">
            If you'd like to be notified when new features are added, or when significant new data is added to the site, please consider subscribing to
            my newsletter.  (This is a low-volume newsletter - I only send out an email when there is something significant to share.  Use the RSS feed
            to track smaller, more frequent updates.)
          </p>
          <p className="text-sm text-gray-700 mb-4">
            <form
              action="https://buttondown.com/api/emails/embed-subscribe/hunter-archives"
              method="post"
              target="popupwindow"
              onSubmit={() => window.open('https://buttondown.com/hunter-archives', 'popupwindow')}
              className="embeddable-buttondown-form flex gap-2 max-w-md"
            >
              <label htmlFor="bd-email" className="sr-only">Enter your email</label>
              <input
                type="email"
                name="email"
                id="bd-email"
                placeholder="your@email.com"
                className="input input-small flex-1"
                required
              />
              <button type="submit" className="btn btn-primary btn-medium">
                Subscribe
              </button>
            </form>
          </p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4 text-center">Today in Robert Hunter Performances</h2>
        {events.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No shows on this date in history</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {events.map((event: any) => (
                <Link
                  key={event.id}
                  href={`/event/${event.slug}`}
                  className={`event-card ${getPerformerCardClass(event)} block py-3 px-6`}
                >
                  <div className="mb-1 text-base font-semibold text-gray-700">{event.primaryBand?.name || 'Robert Hunter'}</div>
                  <div className="mb-2 flex items-center gap-3 text-lg font-semibold">
                    <span>{getEventDisplayDate(event)}</span>
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
          </>
        )}
      </section>
    </PageContainer>
  );
}
