import { prisma } from '@/lib/prisma';

export async function getEventBySlug(slug: string) {
    return prisma.event.findUnique({
        where: { slug },
        include: {
            venue: true,
            primaryBand: true,
            eventMusicians: {
                include: {
                    musician: true,
                    instrument: true,
                },
            },
            sets: {
                include: {
                    setType: true,
                    band: true,
                    setMusicians: {
                        include: {
                            musician: true,
                            instrument: true,
                        },
                    },
                    performances: {
                        include: {
                            song: true,
                            performanceMusicians: {
                                include: {
                                    musician: true,
                                    instrument: true,
                                },
                            },
                        },
                        orderBy: { performanceOrder: 'asc' },
                    },
                },
                orderBy: { position: 'asc' },
            },
            recordings: {
                include: {
                    recordingType: true,
                    contributor: true,
                },
            },
            eventContributors: {
                include: {
                    contributor: true,
                },
            },
            links: true,
        },
    });
}

export async function getEventWithNavigation(slug: string) {
    const event = await getEventBySlug(slug);
    if (!event) return { event: null, prevEvent: null, nextEvent: null };

    let prevEvent = null;
    let nextEvent = null;
    if (event?.sortDate) {
        prevEvent = await prisma.event.findFirst({
            where: {
                isPublic: true,
                sortDate: { lt: event.sortDate },
            },
            orderBy: { sortDate: 'desc' },
            select: { id: true, slug: true, displayDate: true, sortDate: true },
        });
        nextEvent = await prisma.event.findFirst({
            where: {
                isPublic: true,
                sortDate: { gt: event.sortDate },
            },
            orderBy: { sortDate: 'asc' },
            select: { id: true, slug: true, displayDate: true, sortDate: true },
        });
    }
    return { event, prevEvent, nextEvent };
}

export async function searchEvents(filters: any) {
    const page = parseInt(filters?.page || '1', 10) || 1;
    const pageSize = parseInt(filters?.pageSize || '100', 10) || 100;
    const where = filters?.where || {};

    const [totalCount, events] = await Promise.all([
        prisma.event.count({ where }),
        prisma.event.findMany({
            where,
            include: {
                venue: true,
                primaryBand: true,
                eventMusicians: {
                    include: {
                        musician: true,
                        instrument: true,
                    },
                },
                sets: {
                    include: {
                        setType: true,
                        band: true,
                        setMusicians: {
                            include: {
                                musician: true,
                                instrument: true,
                            },
                        },
                        performances: {
                            include: {
                                song: true,
                                performanceMusicians: {
                                    include: {
                                        musician: true,
                                        instrument: true,
                                    },
                                },
                            },
                            orderBy: { performanceOrder: 'asc' },
                        },
                    },
                    orderBy: { position: 'asc' },
                },
                recordings: {
                    include: {
                        recordingType: true,
                        contributor: true,
                    },
                },
                eventContributors: {
                    include: {
                        contributor: true,
                    },
                },
                links: true,
            },
            orderBy: { sortDate: 'asc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        })
    ]);

    return {
        events,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
        pageSize,
    };
}

export async function getEventBySlugWithNavigation(slug: string) {
    const event = await prisma.event.findUnique({
        where: { slug },
        include: {
            venue: true,
            primaryBand: true,
            eventMusicians: {
                include: {
                    musician: true,
                    instrument: true,
                },
            },
            sets: {
                include: {
                    setType: true,
                    band: true,
                    setMusicians: {
                        include: {
                            musician: true,
                            instrument: true,
                        },
                    },
                    performances: {
                        include: {
                            song: true,
                            performanceMusicians: {
                                include: {
                                    musician: true,
                                    instrument: true,
                                },
                            },
                            showBanter: true,
                        },
                        orderBy: { performanceOrder: 'asc' },
                    },
                },
                orderBy: { position: 'asc' },
            },
            recordings: {
                include: {
                    recordingType: true,
                    contributor: true,
                },
            },
            eventContributors: {
                include: {
                    contributor: true,
                },
            },
            links: {
                include: {
                    linkType: true,
                },
            },
        },
    });

    let prevEvent = null;
    let nextEvent = null;
    if (event?.sortDate) {
        prevEvent = await prisma.event.findFirst({
            where: {
                isPublic: true,
                sortDate: { lt: event.sortDate },
            },
            orderBy: { sortDate: 'desc' },
            select: { id: true, slug: true, displayDate: true, sortDate: true },
        });
        nextEvent = await prisma.event.findFirst({
            where: {
                isPublic: true,
                sortDate: { gt: event.sortDate },
            },
            orderBy: { sortDate: 'asc' },
            select: { id: true, slug: true, displayDate: true, sortDate: true },
        });
    }

    return { event, prevEvent, nextEvent };
}
// Moved from queryBuilders/eventQueries.ts
