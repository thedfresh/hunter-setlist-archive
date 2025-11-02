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
            bandMusicians: {
                include: {
                    band: { select: { id: true, name: true, slug: true } },
                },
            },
        },
    });

    // Get all event IDs for each musician from all four sources
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

    // Aggregate event IDs from explicit appearances
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

    // Band membership appearances
    const bandMusicians = await prisma.bandMusician.findMany({
        select: {
            musicianId: true,
            bandId: true,
            joinedDate: true,
            leftDate: true,
        },
    });

    // Get all bands involved
    const bandIds = Array.from(new Set(bandMusicians.map(bm => bm.bandId)));
    const bandEventsById: Record<number, Array<{ id: number, sortDate: Date }>> = {};
    if (bandIds.length > 0) {
        const allBandEvents = await prisma.event.findMany({
            where: {
                ...getCountableEventsWhere(),
                primaryBandId: { in: bandIds },
            },
            select: { id: true, sortDate: true, primaryBandId: true },
        });
        for (const event of allBandEvents) {
            if (!event.primaryBandId) continue;
            if (!event.sortDate) continue;
            if (!bandEventsById[event.primaryBandId]) bandEventsById[event.primaryBandId] = [];
            bandEventsById[event.primaryBandId].push({ id: event.id, sortDate: event.sortDate });
        }
    }

    for (const bm of bandMusicians) {
        const { musicianId, bandId, joinedDate, leftDate } = bm;
        if (!eventIdsByMusician[musicianId]) eventIdsByMusician[musicianId] = new Set();
        const events = bandEventsById[bandId] || [];
        for (const event of events) {
            const sortDate = event.sortDate instanceof Date ? event.sortDate : new Date(event.sortDate);
            let valid = true;
            if (joinedDate && sortDate < joinedDate) valid = false;
            if (leftDate && sortDate > leftDate) valid = false;
            if (valid) {
                eventIdsByMusician[musicianId].add(event.id);
            }
        }
    }

    // Filter musicians with at least one appearance
    const filtered = musicians.filter(m => eventIdsByMusician[m.id]?.size > 0);

    // Check vocals for each musician
    const hasVocalsByMusician: Record<number, boolean> = {};
    for (const m of filtered) {
        let hasVocals = false;
        // Check eventMusician
        const eventVocals = await prisma.eventMusician.findFirst({
            where: { musicianId: m.id, includesVocals: true },
        });
        if (eventVocals) hasVocals = true;
        // Check setMusician
        if (!hasVocals) {
            const setVocals = await prisma.setMusician.findFirst({
                where: { musicianId: m.id, includesVocals: true },
            });
            if (setVocals) hasVocals = true;
        }
        // Check performanceMusician
        if (!hasVocals) {
            const perfVocals = await prisma.performanceMusician.findFirst({
                where: { musicianId: m.id, includesVocals: true },
            });
            if (perfVocals) hasVocals = true;
        }
        hasVocalsByMusician[m.id] = hasVocals;
    }

    // Map results
    return filtered
        .map(m => ({
            id: m.id,
            slug: m.slug,
            displayName: getDisplayName(m),
            firstName: m.firstName,
            lastName: m.lastName,
            defaultInstrument: m.defaultInstrument?.displayName || null,
            appearanceCount: eventIdsByMusician[m.id]?.size || 0,
            bands: m.bandMusicians?.map(bm => bm.band) || [],
            hasVocals: hasVocalsByMusician[m.id] || false,
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
                select: {
                    id: true,
                    joinedDate: true,
                    leftDate: true,
                    band: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
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

    // Band membership events
    const bandMemberships = await prisma.bandMusician.findMany({
        where: { musicianId: musician.id },
        include: {
            band: { select: { id: true } },
        },
    });
    for (const bm of bandMemberships) {
        const { band, joinedDate, leftDate } = bm;
        // Get events for this band
        const bandEvents = await prisma.event.findMany({
            where: {
                ...getBrowsableEventsWhere(),
                primaryBandId: band.id,
            },
            select: {
                id: true,
                slug: true,
                displayDate: true,
                sortDate: true,
                year: true,
                month: true,
                day: true,
                venue: true,
                primaryBand: true,
            },
        });
        for (const event of bandEvents) {
            if (!event.sortDate) continue;
            const sortDate = event.sortDate instanceof Date ? event.sortDate : new Date(event.sortDate);
            let valid = true;
            if (joinedDate && sortDate < joinedDate) valid = false;
            if (leftDate && sortDate > leftDate) valid = false;
            if (valid && !eventDetails[event.id]) {
                eventDetails[event.id] = {
                    event,
                    appearances: [{
                        type: 'band-member',
                        instrument: musician.defaultInstrument?.displayName || null,
                        includesVocals: false,
                    }],
                };
            }
        }
    }

    // Band membership events
    const bandMusicians = await prisma.bandMusician.findMany({
        where: { musicianId: musician.id },
        include: {
            band: { select: { id: true } },
        },
    });
    for (const bm of bandMusicians) {
        const { band, joinedDate, leftDate } = bm;
        // Get events for this band
        const bandEvents = await prisma.event.findMany({
            where: {
                ...getBrowsableEventsWhere(),
                primaryBandId: band.id,
            },
            select: { id: true, sortDate: true },
        });
        for (const event of bandEvents) {
            if (!event.sortDate) continue;
            const sortDate = event.sortDate instanceof Date ? event.sortDate : new Date(event.sortDate);
            let valid = true;
            if (joinedDate && sortDate < joinedDate) valid = false;
            if (leftDate && sortDate > leftDate) valid = false;
            if (valid) {
                if (!eventDetails[event.id]) {
                    eventDetails[event.id] = { event, appearances: [] };
                }
            }
        }
    }

    // Sort events by sortDate DESC
    const events = Object.values(eventDetails)
        .sort((a: any, b: any) => (a.event.sortDate?.getTime?.() || 0) - (b.event.sortDate?.getTime?.() || 0));

    return {
        ...musician,
        events,
    };
}
