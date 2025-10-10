import { prisma } from '@/lib/prisma';
import { getBrowsableEventsWhere } from '@/lib/utils/queryFilters';
import { getEventsBrowse } from './eventBrowseQueries';

// Filter categories for event search
export const FILTER_CATEGORIES = [
    { key: 'all', label: 'All Events', className: 'card', bandNames: [] },
    { key: 'solo', label: 'Solo Hunter', className: 'event-card-solo', bandNames: ['Robert Hunter'] },
    { key: 'roadhog', label: 'Roadhog', className: 'event-card-roadhog', bandNames: ['Roadhog'] },
    { key: 'comfort', label: 'Comfort', className: 'event-card-comfort', bandNames: ['Comfort'] },
    { key: 'dinosaurs', label: 'Dinosaurs', className: 'event-card-dinosaurs', bandNames: ['Dinosaurs'] },
    { key: 'special', label: 'Ad Hoc Bands', className: 'event-card-special', bandNames: [] },
    { key: 'guest', label: 'Guest Appearances', className: 'event-card-guest', bandNames: [] }
];

export async function searchEvents(searchParams: Record<string, string | undefined>) {
    const page = parseInt(searchParams?.page || '1', 10) || 1;

    // Parse selected types from searchParams.types
    const ALL_KEYS = FILTER_CATEGORIES.map((cat) => cat.key);
    const selectedTypes = (searchParams.types?.split(',').map((s) => s.trim()).filter((key) => ALL_KEYS.includes(key))) || ALL_KEYS;

    // Build OR filter for selected categories
    let bandOrFilters: any[] = [];
    if (selectedTypes.length < ALL_KEYS.length) {
        for (const type of selectedTypes) {
            if (type === 'solo') {
                bandOrFilters.push({ primaryBand: { name: 'Robert Hunter' } });
            } else if (type === 'roadhog') {
                bandOrFilters.push({ primaryBand: { name: 'Roadhog' } });
            } else if (type === 'comfort') {
                bandOrFilters.push({ primaryBand: { name: 'Comfort' } });
            } else if (type === 'dinosaurs') {
                bandOrFilters.push({ primaryBand: { name: 'Dinosaurs' } });
            } else if (type === 'special') {
                bandOrFilters.push({ primaryBand: { isHunterBand: true, name: { notIn: ['Robert Hunter', 'Roadhog', 'Comfort', 'Dinosaurs'] } } });
            } else if (type === 'guest') {
                bandOrFilters.push({ primaryBand: { isHunterBand: false } });
            }
        }
    }

    // --- SEARCH FILTER LOGIC ---
    const search = searchParams.search || "";
    const searchType = searchParams.searchType || "";
    let searchFilter: any = null;
    if (search && searchType) {
        if (searchType === "year") {
            const yearNum = parseInt(search);
            if (!isNaN(yearNum)) searchFilter = { year: yearNum };
        } else if (searchType === "yearMonth") {
            const [yearStr, monthStr] = search.split('-');
            const yearNum = parseInt(yearStr);
            const monthNum = parseInt(monthStr);
            if (!isNaN(yearNum) && !isNaN(monthNum)) {
                searchFilter = { year: yearNum, month: monthNum };
            }
        } else if (searchType === "date") {
            const [yearStr, monthStr, dayStr] = search.split('-');
            const yearNum = parseInt(yearStr);
            const monthNum = parseInt(monthStr);
            const dayNum = parseInt(dayStr);
            if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum)) {
                searchFilter = { year: yearNum, month: monthNum, day: dayNum };
            }
        } else if (searchType === "venue") {
            searchFilter = { venue: { name: { contains: search, mode: "insensitive" } } };
        } else if (searchType === "city") {
            searchFilter = { venue: { city: { contains: search, mode: "insensitive" } } };
        } else if (searchType === "state") {
            searchFilter = { venue: { stateProvince: { contains: search, mode: "insensitive" } } };
        } else if (searchType === "band") {
            const band = await prisma.band.findFirst({
                where: { name: { equals: search, mode: 'insensitive' } }
            });
            if (band) {
                searchFilter = { primaryBandId: band.id };
            }
        } else if (searchType === "musician") {
            const musician = await prisma.musician.findFirst({
                where: { name: { equals: search, mode: 'insensitive' } }
            });
            if (musician) {
                searchFilter = {
                    OR: [
                        { eventMusicians: { some: { musicianId: musician.id } } },
                        { sets: { some: { setMusicians: { some: { musicianId: musician.id } } } } },
                        { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: musician.id } } } } } } }
                    ]
                };
            }
        } else if (searchType === "person-all") {
            const [bands, musicians] = await Promise.all([
                prisma.band.findMany({
                    where: { name: { equals: search, mode: 'insensitive' } }
                }),
                prisma.musician.findMany({
                    where: { name: { equals: search, mode: 'insensitive' } }
                })
            ]);
            const bandIds = bands.map(b => b.id);
            const musicianIds = musicians.map(m => m.id);
            if (bandIds.length > 0 || musicianIds.length > 0) {
                searchFilter = {
                    OR: [
                        ...(bandIds.length > 0 ? [{ primaryBandId: { in: bandIds } }] : []),
                        ...(musicianIds.length > 0 ? [
                            { eventMusicians: { some: { musicianId: { in: musicianIds } } } },
                            { sets: { some: { setMusicians: { some: { musicianId: { in: musicianIds } } } } } },
                            { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: { in: musicianIds } } } } } } } },
                            { primaryBand: { bandMusicians: { some: { musicianId: { in: musicianIds } } } } }
                        ] : [])
                    ]
                };
            }
        } else if (searchType === "person-band") {
            const bandId = parseInt(searchParams.bandId || '0');
            const musicianId = parseInt(searchParams.musicianId || '0');
            if (bandId && musicianId) {
                searchFilter = {
                    primaryBandId: bandId,
                    primaryBand: { bandMusicians: { some: { musicianId } } }
                };
            }
        } else if (searchType === "person-guest") {
            const musician = await prisma.musician.findFirst({
                where: { name: { equals: search, mode: 'insensitive' } }
            });
            if (musician) {
                searchFilter = {
                    OR: [
                        { eventMusicians: { some: { musicianId: musician.id } } },
                        { sets: { some: { setMusicians: { some: { musicianId: musician.id } } } } },
                        { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: musician.id } } } } } } }
                    ]
                };
            }
        }
    }

    // Query counts for each filter category
    const allCount = await prisma.event.count({ where: getBrowsableEventsWhere() });
    const soloCount = await prisma.event.count({ where: { primaryBand: { name: 'Robert Hunter' } } });
    const roadhogCount = await prisma.event.count({ where: { primaryBand: { name: 'Roadhog' } } });
    const comfortCount = await prisma.event.count({ where: { primaryBand: { name: 'Comfort' } } });
    const dinosaursCount = await prisma.event.count({ where: { primaryBand: { name: 'Dinosaurs' } } });
    const specialCount = await prisma.event.count({ where: { primaryBand: { isHunterBand: true, name: { notIn: ['Robert Hunter', 'Roadhog', 'Comfort', 'Dinosaurs'] } } } });
    const guestCount = await prisma.event.count({ where: { primaryBand: { isHunterBand: false } } });

    // Deduplicate bandCounts by building from FILTER_CATEGORIES
    const keyToCount: Record<string, number> = {
        all: allCount,
        solo: soloCount,
        roadhog: roadhogCount,
        comfort: comfortCount,
        dinosaurs: dinosaursCount,
        special: specialCount,
        guest: guestCount
    };
    const bandCounts = FILTER_CATEGORIES.map(cat => ({
        key: cat.key,
        label: cat.label,
        className: cat.className,
        count: keyToCount[cat.key] ?? 0
    }));

    // Build where clause for events query
    const baseWhere = getBrowsableEventsWhere();
    let where;
    if (bandOrFilters.length === 0 && !searchFilter) {
        where = baseWhere;
    } else if (bandOrFilters.length > 0 && !searchFilter) {
        where = {
            AND: [
                baseWhere,
                { OR: bandOrFilters }
            ]
        };
    } else if (bandOrFilters.length === 0 && searchFilter) {
        where = {
            AND: [
                baseWhere,
                searchFilter
            ]
        };
    } else {
        where = {
            AND: [
                baseWhere,
                { OR: bandOrFilters },
                searchFilter
            ]
        };
    }

    // Get events and pagination
    const { events, totalCount, currentPage, totalPages, pageSize } = await getEventsBrowse({ page, where });

    // Strip Prisma symbols from events
    const cleanEvents = JSON.parse(JSON.stringify(events));

    return {
        events: cleanEvents,
        bandCounts,
        totalCount,
        currentPage,
        totalPages,
        pageSize,
        selectedTypes,
        search,
        searchType
    };
}
