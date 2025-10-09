// lib/eventQueries.ts
import { prisma } from './prisma';
import { getPrismaDateOrderBy } from '@/lib/dateSort';

export type EventWithAll = Awaited<ReturnType<typeof fetchEventBySlug>>;

export async function fetchEventBySlug(slug: string) {
  // First try direct lookup by slug column
  let event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      primaryBand: true,
      eventType: true,
      contentType: true,
      sets: {
        include: {
          setType: true,
          performances: {
            include: {
              song: true,
              showBanter: { orderBy: { id: 'asc' } },
              performanceMusicians: {
                include: { musician: true, instrument: true },
              },
            },
            orderBy: { performanceOrder: 'asc' },
          },
          band: true,
          setMusicians: {
            include: {
              musician: true,
              instrument: true,
            },
          },
        },
        orderBy: { position: 'asc' },
      },
      eventMusicians: {
        include: { musician: true, instrument: true },
      },
      recordings: {
        include: { recordingType: true, contributor: true },
      },
      eventContributors: {
        include: { contributor: true },
      },
    },
  });
  // Fallback to legacy date-based lookup
  // If not found, do not fallback to legacy date-based lookup (slug is now required)
  return event;
}

export type EventForAdjacent = {
  year: number | null;
  month: number | null;
  day: number | null;
  showTiming?: string | null;
};

export async function fetchAdjacentEvents(event: EventForAdjacent & { slug?: string }) {
  // Fetch all events sorted chronologically by sortDate
  const all = await prisma.event.findMany({
    orderBy: [{ sortDate: 'asc' }],
    select: { year: true, month: true, day: true, showTiming: true, slug: true, sortDate: true },
  });
  // Use only the actual slug
  const targetSlug = event.slug;
  const idx = all.findIndex(e => e.slug === targetSlug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  return {
  prev: prev ? { ...prev, slug: prev.slug } : null,
  next: next ? { ...next, slug: next.slug } : null,
  };
}
