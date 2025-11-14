'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from '@/components/ui/events/EventCard';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

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

  return (
    <>
      {/* Hero Section - Just Title Image */}
      <section className="hero-section">
        <div className="hero-inner">
          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet="/images/title-wide.png"
            />
            <source
              media="(max-width: 1023px)"
              srcSet="/images/title-stacked.png"
            />
            <img
              src="/images/logo-wide.png"
              alt="The Robert Hunter Performance Archive"
              className="hero-title-image"
            />
          </picture>
        </div>
      </section>

      {/* Keep existing "Today in History" content */}
      <div className="px-4 md:px-10 py-6">
        <div className="max-w-6xl mx-auto">
          <section className="mb-10">
            <p className="text-sm text-gray-700 mb-2">
              Hello, and welcome to the resurrected Robert Hunter Performance Archive! I originally built this site in the late '90s as a way to
              document and share Hunter performances from circulating tapes and contemporary tours. I stopped updating the site after his 1998 tour,
              and by the mid-2000s the site was no longer online. In 2025 I developed a plan to rebuild and modernize the site
              leveraging modern technology to create a searchable database of known performances.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              There is still a tremendous amount of work to do - corrections, additions, new recordings and sources - but I hope this early version of the site is a useful resource and a
              good start. If you have information, recordings, or corrections to contribute, please email me at{' '}
              <a href="mailto:dfresh@gmail.com" className="link-internal">dfresh@gmail.com</a>. Enjoy exploring the legacy of Robert Hunter!
            </p>
            <div className="card mt-6 px-6 py-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Get Updates!</h3>
              <p className="text-sm text-gray-700 mb-2">
                If you'd like to be notified when new features are added, or when significant new data is added to the site, please consider subscribing to
                my newsletter. (This is a low-volume newsletter - I only send out an email when there is something significant to share. Use the RSS feed
                to track smaller, more frequent updates.)
              </p>
              <div className="text-sm text-gray-700 mb-4">
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
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-center">Today in Robert Hunter Performances</h2>
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No shows on this date in history</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {events.map((event: any) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    showPrevNext={false}
                    showViewToggle={true}
                    showPerformanceNotes={false}
                    showStageTalk={false}
                    showRecordings={false}
                    showContributors={false}
                    viewMode={'standard'}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}