import { getCountableEventsWhere } from '@/lib/utils/queryFilters';
export async function getBandBySlug(slug: string) {
  const band = await prisma.band.findFirst({
    where: { slug },
    include: {
      bandMusicians: {
        include: {
          musician: {
            select: {
              name: true,
              defaultInstruments: {
                select: {
                  instrument: { select: { displayName: true } }
                }
              }
            }
          },
        },
        orderBy: [{ joinedDate: 'asc' }],
      },
      events: {
        where: getCountableEventsWhere(),
        select: {
          id: true,
          year: true,
          month: true,
          day: true,
          displayDate: true,
          slug: true,
          verified: true,
          sortDate: true,
          venue: { select: { name: true, city: true, stateProvince: true } },
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
      bandMusicians: {
        select: {
          id: true,
          musician: {
            select: {
              name: true,
              defaultInstruments: {
                select: {
                  instrument: { select: { displayName: true } }
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          events: {
            where: getCountableEventsWhere()
          },
          bandMusicians: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  return bands;
}
