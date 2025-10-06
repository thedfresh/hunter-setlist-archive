export async function getVenueBySlug(slug: string) {
  const venue = await prisma.venue.findFirst({
    where: { slug },
    include: {
      links: true,
      events: {
        select: {
          id: true,
          year: true,
          month: true,
          day: true,
          displayDate: true,
          slug: true,
          verified: true,
          primaryBand: { select: { name: true } },
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { day: 'desc' },
        ],
      },
    },
  });
  return venue;
}
import { prisma } from '@/lib/prisma';

export interface GetVenuesBrowseParams {
  state?: string;
  hasShows?: boolean;
}

export async function getVenuesBrowse(/* params: GetVenuesBrowseParams */) {
  // Future: add filters to where
  const where = {};
  const venues = await prisma.venue.findMany({
    where,
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      stateProvince: true,
      publicNotes: true,
      _count: {
        select: { events: true },
      },
    },
    orderBy: { name: 'asc' },
  });
  return venues;
}
