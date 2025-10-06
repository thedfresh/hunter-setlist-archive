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
