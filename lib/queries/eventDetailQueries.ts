
import { getBrowsableEventsWhere, getCountableEventsWhere } from '@/lib/utils/queryFilters';

type EventType = {
    sets?: Array<{ performances: any[] }>;
    sortDate: string | Date | null;
    year: number | null;
    primaryBandId: number | null;
};

export async function calculateEventStatistics(event: EventType) {
    const firstPerformances: Array<{ songId: number; songTitle: string; songSlug: string }> = [];
    const lastPerformances: Array<{ songId: number; songTitle: string; songSlug: string }> = [];
    const onlyPerformances: Array<{ songId: number; songTitle: string; songSlug: string }> = [];
    const comebacks: Array<{ songId: number; songTitle: string; songSlug: string; gap: number }> = [];

    // Flatten all performances in all sets
    const performances = event.sets?.flatMap((set: { performances: any[] }) => set.performances) || [];
    const filteredPerformances = performances.filter(
        (perf: any) => perf.song.title !== 'Unknown Song'
    );

    for (const perf of filteredPerformances) {
        const songId = perf.song.id;
        const songTitle = perf.song.title;
        const songSlug = perf.song.slug;
        const perfDate = event.sortDate;
        const eventYear = event.year;
        //const isHunterShow = !event.primaryBandId || event.primaryBandId === 6;

        // FIRST/LAST/ONLY PERFORMANCE (mutually exclusive)
        const [earlier, later] = await Promise.all([
            prisma.performance.findFirst({
                where: {
                    songId,
                    set: {
                        event: {
                            ...getBrowsableEventsWhere(),
                            ...(perfDate ? { sortDate: { lt: perfDate } } : {}),
                        },
                    },
                },
            }),
            prisma.performance.findFirst({
                where: {
                    songId,
                    set: {
                        event: {
                            ...getBrowsableEventsWhere(),
                            ...(perfDate ? { sortDate: { gt: perfDate } } : {}),
                        },
                    },
                },
            })
        ]);

        if (!earlier && !later) {
            if (!onlyPerformances.some(p => p.songId === songId)) {
                onlyPerformances.push({ songId, songTitle, songSlug });
            }
        } else if (!earlier) {
            if (!firstPerformances.some(p => p.songId === songId)) {
                firstPerformances.push({ songId, songTitle, songSlug });
            }
        } else if (!later) {
            if (!lastPerformances.some(p => p.songId === songId)) {
                lastPerformances.push({ songId, songTitle, songSlug });
            }
        }

        // COMEBACK (gap >= 50)
        // Find previous performance
        let prevPerf = null;
        if (perfDate) {
            prevPerf = await prisma.performance.findFirst({
                where: {
                    songId,
                    set: {
                        event: {
                            ...getCountableEventsWhere(),
                            sortDate: { lt: perfDate },
                        },
                    },
                },
                orderBy: [{ set: { event: { sortDate: 'desc' } } }],
                include: { set: { include: { event: true } } },
            });
        }
        if (prevPerf && prevPerf.set && prevPerf.set.event && prevPerf.set.event.sortDate && perfDate) {
            // Only count gap if previous sortDate and current perfDate are valid
            const gapCount = await prisma.event.count({
                where: {
                    ...getCountableEventsWhere(),
                    sortDate: { gt: prevPerf.set.event.sortDate, lt: perfDate },
                    sets: { some: { performances: { some: {} } } },
                    OR: [
                        { primaryBandId: null },
                        { primaryBand: { isHunterBand: true } },
                    ],
                },
            });
            if (gapCount >= 50 && !comebacks.some(p => p.songId === songId)) {
                comebacks.push({ songId, songTitle, songSlug, gap: gapCount });
            }
        }
    }

    return {
        firstPerformances,
        lastPerformances,
        onlyPerformances,
        comebacks,
    };
}
import { prisma } from '@/lib/prisma';

export async function getEventBySlug(slug: string) {
    const event = await prisma.event.findUnique({
        where: { slug },
        include: {
            venue: true,
            primaryBand: true,
            eventType: true,
            contentType: true,
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
                            leadVocals: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            },
                            song: {
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                    songTags: {
                                        include: {
                                            tag: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                }
                                            }
                                        }
                                    },
                                    leadVocals: {
                                        select: {
                                            id: true,
                                            name: true,
                                        }
                                    }
                                }
                            },
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
    if (!event || !event.isPublic) {
        return null;
    }
    return event;
}

export async function getEventWithNavigation(slug: string, isAdmin: boolean = false) {
    const event = await getEventBySlug(slug);
    if (!event) return { event: null, prevEvent: null, nextEvent: null };

    let prevEvent = null;
    let nextEvent = null;
    if (event?.sortDate) {
        prevEvent = await prisma.event.findFirst({
            where: isAdmin ? {
                OR: [
                    { sortDate: { lt: event.sortDate } },
                    {
                        sortDate: event.sortDate,
                        id: { lt: event.id }
                    }
                ]
            } : {
                isPublic: true,
                OR: [
                    { sortDate: { lt: event.sortDate } },
                    {
                        sortDate: event.sortDate,
                        id: { lt: event.id }
                    }
                ]
            },
            orderBy: [
                { sortDate: 'desc' },
                { id: 'desc' }
            ],
            select: { id: true, slug: true, displayDate: true, sortDate: true },
        });

        nextEvent = await prisma.event.findFirst({
            where: isAdmin ? {
                OR: [
                    { sortDate: { gt: event.sortDate } },
                    {
                        sortDate: event.sortDate,
                        id: { gt: event.id }
                    }
                ]
            } : {
                isPublic: true,
                OR: [
                    { sortDate: { gt: event.sortDate } },
                    {
                        sortDate: event.sortDate,
                        id: { gt: event.id }
                    }
                ]
            },
            orderBy: [
                { sortDate: 'asc' },
                { id: 'asc' }
            ],
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
                eventType: true,
                contentType: true,
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
                                leadVocals: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                },
                                song: {
                                    select: {
                                        id: true,
                                        title: true,
                                        slug: true,
                                        songTags: {
                                            include: {
                                                tag: {
                                                    select: {
                                                        id: true,
                                                        name: true,
                                                    }
                                                }
                                            }
                                        },
                                        leadVocals: {
                                            select: {
                                                id: true,
                                                name: true,
                                            }
                                        }
                                    }
                                },
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
            eventType: true,
            contentType: true,
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
                            leadVocals: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            },
                            song: {
                                select: {
                                    id: true,
                                    title: true,
                                    slug: true,
                                    songTags: {
                                        include: {
                                            tag: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                }
                                            }
                                        }
                                    },
                                    leadVocals: {
                                        select: {
                                            id: true,
                                            name: true,
                                        }
                                    }
                                }
                            },
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

    // Return null if event is private
    if (!event || !event.isPublic) {
        return { event: null, prevEvent: null, nextEvent: null };
    }

    let prevEvent = null;
    let nextEvent = null;
    if (event?.sortDate) {
        prevEvent = await prisma.event.findFirst({
            where: {
                isPublic: true,
                OR: [
                    { sortDate: { lt: event.sortDate } },
                    {
                        sortDate: event.sortDate,
                        id: { lt: event.id }
                    }
                ]
            },
            orderBy: [
                { sortDate: 'desc' },
                { id: 'desc' }
            ],
            select: { id: true, slug: true, displayDate: true, sortDate: true },
        });
        nextEvent = await prisma.event.findFirst({
            where: {
                isPublic: true,
                OR: [
                    { sortDate: { gt: event.sortDate } },
                    {
                        sortDate: event.sortDate,
                        id: { gt: event.id }
                    }
                ]
            },
            orderBy: [
                { sortDate: 'asc' },
                { id: 'asc' }
            ],
            select: { id: true, slug: true, displayDate: true, sortDate: true },
        });
    }

    return { event, prevEvent, nextEvent };
}