import { prisma } from '@/lib/prisma';
import { getCountableEventsWhere, getBrowsableEventsWhere } from '@/lib/utils/queryFilters';
export async function getVenueBySlug(slug: string) {
  const venue = await prisma.venue.findFirst({
    where: { slug },
    include: {
      links: true,
      events: {
        where: getBrowsableEventsWhere(),
        select: {
          id: true,
          year: true,
          month: true,
          day: true,
          displayDate: true,
          slug: true,
          verified: true,
          sortDate: true,
          primaryBand: { select: { name: true } },
          eventType: { select: { name: true, includeInStats: true } },
        },
        orderBy: [
          { sortDate: 'asc' },
          { year: 'asc' },
          { month: 'asc' },
          { day: 'asc' },
        ],
      },
    },
  });
  return venue;
}

export interface GetVenuesBrowseParams {
  state?: string;
  hasShows?: boolean;
}

export async function getVenuesBrowse(options?: { includePrivate?: boolean }) {
  const venues = await prisma.venue.findMany({
    where: {},
    select: {
      id: true,
      slug: true,
      name: true,
      context: true,
      city: true,
      stateProvince: true,
      publicNotes: true,
      _count: {
        select: {
          events: options?.includePrivate
            ? true // Admin: count all events
            : {
              where: {
                isPublic: true,
                eventType: {
                  name: { not: 'Errata' }
                }
              }
            }
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  // For public pages, filter out venues with no qualifying events
  if (!options?.includePrivate) {
    return venues.filter(v => v._count.events > 0);
  }
  return venues;
}
