import { prisma } from "@/lib/prisma";
import { getCountableEventsWhere, getBrowsableEventsWhere } from "@/lib/utils/queryFilters";

// Utility to get display name
function getDisplayName(m: any) {
    return m.displayName || (m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.name);
}

export async function getMusiciansBrowse() {
    // Find musicians with appearances in countable events
    const musicians = await prisma.musician.findMany({
        include: {
            defaultInstrument: { select: { displayName: true } },
        },
    });

    // Get all event IDs for each musician from all three sources
    const eventIdsByMusician: Record<number, Set<number>> = {};
    const eventMusicians = await prisma.eventMusician.findMany({
        where: { event: getCountableEventsWhere() },
        select: { musicianId: true, eventId: true },
    });
    const setMusicians = await prisma.setMusician.findMany({
        where: { set: { event: getCountableEventsWhere() } },
        select: { musicianId: true, set: { select: { eventId: true } } },
    });
    const performanceMusicians = await prisma.performanceMusician.findMany({
        where: { performance: { set: { event: getCountableEventsWhere() } } },
        select: { musicianId: true, performance: { select: { set: { select: { eventId: true } } } } },
    });

    // Aggregate event IDs
    for (const em of eventMusicians) {
        if (!eventIdsByMusician[em.musicianId]) eventIdsByMusician[em.musicianId] = new Set();
        eventIdsByMusician[em.musicianId].add(em.eventId);
    }
    for (const sm of setMusicians) {
        if (!eventIdsByMusician[sm.musicianId]) eventIdsByMusician[sm.musicianId] = new Set();
        eventIdsByMusician[sm.musicianId].add(sm.set.eventId);
    }
    for (const pm of performanceMusicians) {
        if (!eventIdsByMusician[pm.musicianId]) eventIdsByMusician[pm.musicianId] = new Set();
        eventIdsByMusician[pm.musicianId].add(pm.performance.set.eventId);
    }

    // Filter musicians with at least one appearance
    const filtered = musicians.filter(m => eventIdsByMusician[m.id]?.size > 0);

    // Map results
    return filtered
        .map(m => ({
            id: m.id,
            slug: m.slug,
            displayName: getDisplayName(m),
            defaultInstrument: m.defaultInstrument?.displayName || null,
            appearanceCount: eventIdsByMusician[m.id]?.size || 0,
        }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getMusicianBySlug(slug: string) {
    const musician = await prisma.musician.findUnique({
        where: { slug },
        select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            slug: true,
            publicNotes: true,
            defaultInstrument: true,
            bandMusicians: {
                include: {
                    band: true,
                },
            },
        },
    });
    if (!musician) return null;

    // Get all public events for this musician
    const eventIds = new Set<number>();
    const eventSelect = {
        id: true,
        slug: true,
        displayDate: true,
        sortDate: true,
        year: true,
        month: true,
        day: true,
        venue: true,
        primaryBand: true,
    };
    const eventMusicians = await prisma.eventMusician.findMany({
        where: { musicianId: musician.id, event: getBrowsableEventsWhere() },
        include: {
            event: { select: eventSelect },
            instrument: true,
        },
    });
    const setMusicians = await prisma.setMusician.findMany({
        where: { musicianId: musician.id, set: { event: getBrowsableEventsWhere() } },
        include: {
            set: {
                select: {
                    event: { select: eventSelect },
                },
            },
            instrument: true,
        },
    });
    const performanceMusicians = await prisma.performanceMusician.findMany({
        where: { musicianId: musician.id, performance: { set: { event: getBrowsableEventsWhere() } } },
        include: {
            performance: {
                select: {
                    set: {
                        select: {
                            event: { select: eventSelect },
                        },
                    },
                    song: true,
                },
            },
            instrument: true,
        },
    });

    // Group performances by event
    const eventDetails: Record<number, any> = {};
    for (const em of eventMusicians) {
        const eid = em.event.id;
        if (!eventDetails[eid]) eventDetails[eid] = { event: em.event, appearances: [] };
        eventDetails[eid].appearances.push({
            type: 'event',
            instrument: em.instrument?.displayName || null,
            includesVocals: em.includesVocals || false,
        });
    }
    for (const sm of setMusicians) {
        const eid = sm.set.event.id;
        if (!eventDetails[eid]) eventDetails[eid] = { event: sm.set.event, appearances: [] };
        eventDetails[eid].appearances.push({
            type: 'set',
            instrument: sm.instrument?.displayName || null,
            includesVocals: sm.includesVocals || false,
        });
    }
    for (const pm of performanceMusicians) {
        const eid = pm.performance.set.event.id;
        if (!eventDetails[eid]) eventDetails[eid] = { event: pm.performance.set.event, appearances: [] };
        eventDetails[eid].appearances.push({
            type: 'performance',
            song: pm.performance.song?.title || null,
            instrument: pm.instrument?.displayName || null,
            includesVocals: pm.includesVocals || false,
        });
    }

    // Sort events by sortDate DESC
    const events = Object.values(eventDetails)
        .sort((a: any, b: any) => (a.event.sortDate?.getTime?.() || 0) - (b.event.sortDate?.getTime?.() || 0));

    return {
        ...musician,
        events,
    };
}
