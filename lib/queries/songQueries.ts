
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
    const song = await prisma.song.findFirst({
        where: { slug },
        include: {
            songAlbums: { include: { album: true } },
            songTags: { include: { tag: true } },
            leadVocals: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
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

    if (!song) return null;

    // Calculate gaps between performances
    const performances = song.performances || [];
    // Already sorted by date in UI, but ensure sort here for gap calculation
    performances.sort((a: any, b: any) => {
        const aDate = a.set?.event?.sortDate ? new Date(a.set.event.sortDate) : null;
        const bDate = b.set?.event?.sortDate ? new Date(b.set.event.sortDate) : null;
        if (!aDate || !bDate) return 0;
        return aDate.getTime() - bDate.getTime();
    });

    const getCountableEventsWhere = (await import('@/lib/utils/queryFilters')).getCountableEventsWhere;

    const performancesWithGap = [];
    for (let i = 0; i < performances.length; i++) {
        let gap: number | null = null;
        if (i > 0) {
            const prevPerf = performances[i - 1];
            const currPerf = performances[i];
            const prevDate = prevPerf.set?.event?.sortDate;
            const currDate = currPerf.set?.event?.sortDate;
            if (prevDate && currDate) {
                gap = await prisma.event.count({
                    where: {
                        AND: [
                            { sortDate: { gt: prevDate } },
                            { sortDate: { lt: currDate } },
                            { sets: { some: { performances: { some: {} } } } },
                            {
                                OR: [
                                    { primaryBandId: null },
                                    { primaryBand: { isHunterBand: true } }
                                ]
                            },
                            getCountableEventsWhere(),
                        ]
                    }
                });
            }
        }
        performancesWithGap.push({ ...performances[i], gap });
    }

    return { ...song, performances: performancesWithGap };
}
// Moved from queryBuilders/songQueries.ts
