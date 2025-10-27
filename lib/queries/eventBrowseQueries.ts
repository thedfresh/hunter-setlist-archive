import { getBrowsableEventsWhere, getCountableEventsWhere } from '@/lib/utils/queryFilters';
export type GetEventsBrowseParams = {
  page?: number;
  pageSize?: number;
  where?: any;
  // For future filters:
  performerType?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  verified?: boolean;
};
// Get Hunter performance stats for hub page
export async function getHunterPerformanceStats() {
  // Total show count
  const totalShows = await prisma.event.count({
    where: getCountableEventsWhere()
  });

  // First and last show (by date)
  const firstShow = await prisma.event.findFirst({
    where: getCountableEventsWhere(),
    orderBy: { sortDate: 'asc' },
    select: { year: true, month: true, day: true, displayDate: true, sortDate: true }
  });
  const lastShow = await prisma.event.findFirst({
    where: getCountableEventsWhere(),
    orderBy: { sortDate: 'desc' },
    select: { year: true, month: true, day: true, displayDate: true, sortDate: true }
  });

  // Breakdown by performer type (primaryBand.name)
  const bandCounts = await prisma.event.groupBy({
    by: ['primaryBandId'],
    where: getCountableEventsWhere(),
    _count: { _all: true },
  });
  // Get band names for each id
  const bandIds = bandCounts.map(bc => bc.primaryBandId).filter((id): id is number => id !== null);
  const bands = await prisma.band.findMany({
    where: { id: { in: bandIds } },
    select: { id: true, name: true },
  });
  const bandNameMap = Object.fromEntries(bands.map(b => [b.id, b.name]));
  const breakdown = bandCounts.map(bc => ({
    name: bc.primaryBandId === null ? 'Solo' : (bandNameMap[bc.primaryBandId] || 'Other'),
    count: bc._count._all,
  }));

  return {
    totalShows,
    firstShow,
    lastShow,
    breakdown,
  };
}

// Get all events that happened on this month and day (any year)
export async function getEventsOnThisDate() {
  const now = new Date();
  const month = now.getMonth() + 1; // JS months are 0-based
  const day = now.getDate();
  const events = await prisma.event.findMany({
    where: {
      ...getBrowsableEventsWhere(),
      month,
      day,
    },
    select: {
      id: true,
      year: true,
      month: true,
      day: true,
      displayDate: true,
      slug: true,
      verified: true,
      showTiming: true,
      venue: {
        select: {
          name: true,
          city: true,
          stateProvince: true,
        },
      },
      primaryBand: {
        select: {
          name: true,
        },
      },
      eventType: { select: { name: true } },
      contentType: { select: { name: true } },
      sets: {
        select: {
          id: true,
          setType: { select: { displayName: true } },
          performances: {
            select: {
              id: true,
              song: { select: { title: true } },
              seguesInto: true,
              performanceOrder: true,
            },
            orderBy: { performanceOrder: 'asc' },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { sortDate: 'asc' },
  });
  return events;
}
import { prisma } from '@/lib/prisma';
import { getPrismaDateOrderBy } from '@/lib/utils/dateSort';

export async function getEventsBrowse({ page, pageSize = 100, where = {} }: GetEventsBrowseParams) {
  const finalWhere = Object.keys(where).length > 0 ? where : getBrowsableEventsWhere();
  const skipPagination = !page;

  const queryOptions: any = {
    where: finalWhere,
    include: {
      venue: true,
      primaryBand: true,
      eventType: true,
      contentType: true,
      eventMusicians: {
        include: { musician: true, instrument: true }
      },
      sets: {
        include: {
          setType: true,
          band: true,
          setMusicians: { include: { musician: true, instrument: true } },
          performances: {
            include: {
              song: {
                include: {
                  songTags: {
                    include: {
                      tag: true
                    }
                  }
                }
              },
              performanceMusicians: { include: { musician: true, instrument: true } }
            },
            orderBy: { performanceOrder: 'asc' }
          }
        },
        orderBy: { position: 'asc' }
      },
      recordings: { include: { recordingType: true, contributor: true } },
      eventContributors: { include: { contributor: true } },
      links: { include: { linkType: true } }
    },
    orderBy: { sortDate: 'asc' }
  };

  if (!skipPagination) {
    queryOptions.skip = ((page || 1) - 1) * pageSize;
    queryOptions.take = pageSize;
  }

  const [totalCount, events] = await Promise.all([
    prisma.event.count({ where: finalWhere }),
    prisma.event.findMany(queryOptions)
  ]);

  return {
    events,
    totalCount,
    currentPage: page || 1,
    totalPages: skipPagination ? 1 : Math.ceil(totalCount / pageSize),
    pageSize
  };
}