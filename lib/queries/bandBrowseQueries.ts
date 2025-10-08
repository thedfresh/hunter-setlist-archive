export async function getBandBySlug(slug: string) {
  const band = await prisma.band.findFirst({
    where: { slug },
    include: {
      bandMusicians: {
        include: {
          musician: { select: { name: true } },
        },
        orderBy: [
          { joinedDate: 'asc' },
        ],
      },
      events: {
        select: {
          id: true,
          year: true,
          month: true,
          day: true,
          displayDate: true,
          slug: true,
          verified: true,
          venue: { select: { name: true, city: true, stateProvince: true } },
        },
        orderBy: [
          { year: 'desc' },
          { month: 'desc' },
          { day: 'desc' },
        ],
      },
    },
  });
  return band;
}
import { prisma } from '@/lib/prisma';

export async function getBandsBrowse() {
  const bands = await prisma.band.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      displayName: true,
      isHunterBand: true,
      publicNotes: true,
      _count: {
        select: {
          events: true,
          bandMusicians: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  return bands;
}
