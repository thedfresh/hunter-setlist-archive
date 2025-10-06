// Get Hunter performance stats for hub page
export async function getHunterPerformanceStats() {
  // Total show count
  const totalShows = await prisma.event.count();

  // First and last show (by date)
  const firstShow = await prisma.event.findFirst({
    orderBy: [
      { year: 'asc' },
      { month: 'asc' },
      { day: 'asc' },
    ],
    select: { year: true, month: true, day: true, displayDate: true }
  });
  const lastShow = await prisma.event.findFirst({
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { day: 'desc' },
    ],
    select: { year: true, month: true, day: true, displayDate: true }
  });

  // Breakdown by performer type (primaryBand.name)
  const bandCounts = await prisma.event.groupBy({
    by: ['primaryBandId'],
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
    orderBy: {
      year: 'asc',
    },
  });
  return events;
}
import { prisma } from '@/lib/prisma';

export interface GetEventsBrowseParams {
  page?: number;
  pageSize?: number;
  // For future filters:
  performerType?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  verified?: boolean;
}

export async function getEventsBrowse({ page = 1, pageSize = 100 }: GetEventsBrowseParams) {
  // Future: add filters to where
  const where = {};

  const [totalCount, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      include: {
        venue: true,
        primaryBand: true,
        sets: {
          include: {
            setType: true,
            performances: {
              include: {
                song: true,
              },
              orderBy: { performanceOrder: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
        { day: 'asc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    events,
    totalCount,
    currentPage: page,
    totalPages,
    pageSize,
  };
}
