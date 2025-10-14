import EventCard from '@/components/ui/events/EventCard';
import { getEventBySlugWithNavigation } from '@/lib/queries/eventDetailQueries';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';
import { formatEventDate } from '@/lib/formatters/dateFormatter';
import { formatVenue } from '@/lib/formatters/venueFormatter';
import { getEventBySlug } from '@/lib/queries/eventDetailQueries';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    return {
      title: 'Event Not Found | Hunter Archive',
    };
  }

  const performer = event.primaryBand?.name || 'Robert Hunter';
  const venue = event.venue;
  const title = venue
    ? `${formatEventDate(event)} - ${performer} at ${formatVenue(venue)} | Hunter Archive`
    : `${formatEventDate(event)} - ${performer} | Hunter Archive`;

  return {
    title,
    description: `Setlist and recordings from ${performer}${venue ? ` at ${venue}` : ''}`,
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const { event, prevEvent, nextEvent } = await getEventBySlugWithNavigation(params.slug);
  if (!event) return notFound();
  return (
    <PageContainer>
      <EventCard
        event={event}
        variant="detail"
        prevEvent={prevEvent}
        nextEvent={nextEvent}
        showPrevNext={true}
        showPerformanceNotes={true}
        showStageTalk={true}
        showRecordings={true}
        showContributors={true}
      />
    </PageContainer>
  );
}
