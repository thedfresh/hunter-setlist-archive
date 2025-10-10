import EventCard from '@/components/ui/events/EventCard';
import { getEventBySlugWithNavigation } from '@/lib/queries/eventDetailQueries';
import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/ui/PageContainer';

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
