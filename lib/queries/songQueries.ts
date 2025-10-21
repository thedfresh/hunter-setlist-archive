export async function calculateSongPerformanceStats(songId: number) {
    // Get all performances with event data, excluding non-countable events
    const performances = await prisma.performance.findMany({
        where: {
            songId,
            set: {
                setType: { includeInStats: true },
                event: {
                    eventType: { includeInStats: true }
                }
            }
        },
        select: {
            set: {
                select: {
                    event: {
                        select: {
                            id: true,
                            sortDate: true,
                            displayDate: true,
                            slug: true,
                        }
                    }
                }
            }
        }
    });

    // Extract unique events (song performed multiple times in same show = 1 count)
    const eventMap = new Map();
    performances.forEach(perf => {
        const event = perf.set?.event;
        if (event && event.sortDate) {
            eventMap.set(event.id, {
                sortDate: String(event.sortDate),
                date: String(event.displayDate || ''),
                slug: String(event.slug || ''),
            });
        }
    });

    const dates = Array.from(eventMap.values());
    const performanceCount = dates.length;

    let firstPerformance = null;
    let lastPerformance = null;
    if (performanceCount > 0) {
        const sortedDates = dates.sort(
            (a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime()
        );
        firstPerformance = sortedDates[0];
        lastPerformance = sortedDates[sortedDates.length - 1];
    }

    return { performanceCount, firstPerformance, lastPerformance };
}
import { prisma } from '@/lib/prisma';
import { getBrowsableEventsWhere } from '@/lib/utils/queryFilters';

/**
 * Fetches a single song by slug, including all related albums, tags, links,
 * countable performances, and browsable performance dates.
 * Returns the raw Prisma result (no sorting).
 *
 * @param slug - The song slug to look up
 * @returns The song object with all included relations, or null if not found
 */
export async function getSongWithPerformances(slug: string) {
    return prisma.song.findFirst({
        where: { slug },
        include: {
            songAlbums: { include: { album: true } },
            songTags: { include: { tag: true } },
            leadVocals: {
                select: {
                    id: true,
                    name: true,
                }
            },
            links: {
                include: {
                    linkType: true,
                }
            },
            parentSong: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    arrangement: true,
                }
            },
            variants: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    arrangement: true,
                },
                orderBy: {
                    arrangement: 'asc',
                }
            },
            performances: {
                where: {
                    set: { event: getBrowsableEventsWhere() }
                },
                include: {
                    song: { select: { id: true, title: true, slug: true } },
                    set: {
                        include: {
                            performances: {
                                include: { song: { select: { id: true, title: true, slug: true } } }
                            },
                            event: {
                                select: {
                                    id: true,
                                    slug: true,
                                    year: true,
                                    month: true,
                                    day: true,
                                    displayDate: true,
                                    showTiming: true,
                                    sortDate: true,
                                    eventType: { select: { name: true, includeInStats: true } },
                                    venue: {
                                        select: {
                                            id: true,
                                            slug: true,
                                            name: true,
                                            context: true,
                                            stateProvince: true,
                                            city: true,
                                            country: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}
// Moved from queryBuilders/songQueries.ts
