import { getBrowsableEventsWhere, getCountableEventsWhere } from '@/lib/utils/queryFilters';

export async function getBandBySlug(slug: string) {
  const band = await prisma.band.findFirst({
    where: { slug },
    include: {
      bandMusicians: {
        select: {
          id: true,
          joinedDate: true,
          leftDate: true,
          publicNotes: true,
          musician: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              slug: true,
              defaultInstruments: {
                include: {
                  instrument: true
                }
              }
            }
          }
        },
        orderBy: [{ joinedDate: 'asc' }],
      },
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
          showTiming: true,
          venue: {
            select: {
              name: true,
              city: true,
              stateProvince: true,
              context: true,
              slug: true
            }
          }
        },
        orderBy: [
          { sortDate: 'asc' },
          { year: 'asc' },
          { month: 'asc' },
          { day: 'asc' },
        ],
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
