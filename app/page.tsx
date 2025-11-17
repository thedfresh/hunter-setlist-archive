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
              src="/images/title-wide.png"
              alt="The Robert Hunter Performance Archive"
              className="hero-title-image"
            />
          </picture>
        </div>
      </section>

      {/* Two Column Layout */}
      <div className="px-4 md:px-10 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Introduction */}
            <section>
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
                    className="embeddable-buttondown-form flex gap-2"
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
              <div className="pt-4">
                <img
                  src="/images/hunter-1980s.png"
                  alt="Robert Hunter performing"
                  className="w-full h-auto rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">
                  <span className="text-sm text-gray-600 mt-2 italic">
                    Philadelphia, early '80s
                  </span> -
                  Photo by{' '}
                  <a
                    href="https://www.flickr.com/photos/80502454@N00/2118101391/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-external"
                  >
                    <span>David Saddler</span>
                  </a>
                  {' '}(
                  <a
                    href="https://creativecommons.org/licenses/by/2.0/deed.en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-external"
                  >
                    <span>CC BY 2.0</span>
                  </a>
                  )
                </p>
              </div>

            </section>

            {/* Right Column - Today in History */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Today in Robert Hunter Performances</h2>
              {loading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No shows on this date in history</div>
              ) : (
                <div className="space-y-4">
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
      </div>
    </>
  );
}