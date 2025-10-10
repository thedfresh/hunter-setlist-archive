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
import { getCountablePerformancesWhere, getBrowsableEventsWhere } from '@/lib/queryFilters';

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
                    set: {
                        include: {
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
                                            stateProvince: true,
                                            country: true,
                                        },
                                    },
                                },
                            },
                            performances: {
                                include: {
                                    song: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
}

/**
 * Fetches all songs with performance statistics:
 * - performanceCount
 * - firstPerformance (date, slug, sortDate)
 * - lastPerformance (date, slug, sortDate)
 * Uses getCountablePerformancesWhere for filtering and sortDate for sorting.
 *
 * @returns Array of songs with stats: id, title, slug, performanceCount, firstPerformance, lastPerformance
 */
export async function getAllSongsWithPerformanceStats() {
    // Get all non-medley performances with event dates
    const performances = await prisma.performance.findMany({
        where: getCountablePerformancesWhere(),
        select: {
            songId: true,
            set: {
                select: {
                    event: {
                        select: {
                            year: true,
                            month: true,
                            day: true,
                            displayDate: true,
                            showTiming: true,
                            slug: true,
                            eventType: true,
                            sortDate: true,
                        }
                    },
                    setType: {
                        select: {
                            displayName: true,
                        }
                    }
                }
            }
        }
    });

    // Group by songId
    const songData = new Map<number, {
        count: number;
        dates: { sortDate: string; display: string; slug: string }[];
    }>();

    performances.forEach(perf => {
        const event = perf.set && perf.set.event;
        if (!event || !event.year) return;
        // Use displayDate for display, sortDate for sorting
        const sortDate = event.sortDate ? String(event.sortDate) : '';
        const display = event.displayDate ? String(event.displayDate) : '';
        const slug = event.slug ? String(event.slug) : '';
        if (!songData.has(perf.songId)) {
            songData.set(perf.songId, {
                count: 0,
                dates: []
            });
        }
        const data = songData.get(perf.songId)!;
        data.count++;
        data.dates.push({ sortDate, display, slug });
    });

    // Fetch all songs
    const songs = await prisma.song.findMany({
        include: {
            songAlbums: { include: { album: true } },
            songTags: { include: { tag: true } },
            links: true,
        },
        orderBy: { title: "asc" },
    });

    // Build stats array
    return songs.map(song => {
        const data = songData.get(song.id);
        let performanceCount = 0;
        let firstPerformance: { date: string; slug: string; sortDate: string } | null = null;
        let lastPerformance: { date: string; slug: string; sortDate: string } | null = null;
        if (data && data.dates.length > 0) {
            const sortedDates = data.dates.sort((a, b) =>
                new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime()
            );
            performanceCount = data.count;
            firstPerformance = {
                date: sortedDates[0].display,
                slug: sortedDates[0].slug,
                sortDate: sortedDates[0].sortDate,
            };
            lastPerformance = {
                date: sortedDates[sortedDates.length - 1].display,
                slug: sortedDates[sortedDates.length - 1].slug,
                sortDate: sortedDates[sortedDates.length - 1].sortDate,
            };
        }
        return {
            id: song.id,
            title: song.title,
            slug: song.slug,
            performanceCount,
            firstPerformance,
            lastPerformance,
        };
    });
}
