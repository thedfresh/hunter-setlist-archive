/**
 * Calculates performance stats for a song:
 * - performanceCount
 * - firstPerformance (date, slug, sortDate)
 * - lastPerformance (date, slug, sortDate)
 * Only includes countable performances (excludes studios, medleys, etc).
 *
 * @param songId - The song's ID
 * @returns { performanceCount, firstPerformance, lastPerformance }
 */
export async function calculateSongPerformanceStats(songId: number) {
    const performances = await prisma.performance.findMany({
        where: {
            songId,
            ...getCountablePerformancesWhere(),
        },
        select: {
            set: {
                select: {
                    event: {
                        select: {
                            sortDate: true,
                            displayDate: true,
                            slug: true,
                        }
                    }
                }
            }
        }
    });

    const dates = performances
        .map(perf => {
            const event = perf.set?.event;
            return event && event.sortDate
                ? {
                    sortDate: String(event.sortDate),
                    date: String(event.displayDate || ''),
                    slug: String(event.slug || ''),
                }
                : null;
        })
        .filter(Boolean) as { sortDate: string; date: string; slug: string }[];

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
import { getCountablePerformancesWhere, getBrowsableEventsWhere } from '@/lib/utils/queryFilters';

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
            links: true,
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
                                            city: true,
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
