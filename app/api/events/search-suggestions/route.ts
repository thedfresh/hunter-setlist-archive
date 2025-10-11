import { NextRequest, NextResponse } from 'next/server';
import { getBrowsableEventsWhere } from '@/lib/utils/queryFilters';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
export const dynamic = 'force-dynamic';

// Helper: detect date patterns
function detectDateType(query: string) {
    if (/^\d{4}$/.test(query)) return 'year';
    if (/^\d{4}-\d{2}$/.test(query)) return 'yearMonth';
    if (/^\d{4}-\d{2}-\d{2}$/.test(query)) return 'date';
    return null;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();
    if (!query) return NextResponse.json({ suggestions: [] });

    const suggestions: any[] = [];
    const dateType = detectDateType(query);

    // 1. Date patterns: year, year-month, year-month-day
    if (dateType === 'year') {
        const yearNum = parseInt(query);
        if (!isNaN(yearNum)) {
            const count = await prisma.event.count({
                where: {
                    AND: [
                        getBrowsableEventsWhere(),
                        { year: yearNum }
                    ]
                }
            });
            if (count > 0) {
                suggestions.push({
                    type: 'year',
                    value: String(yearNum),
                    label: `${yearNum} (${count} shows)`
                });
            }
        }
    } else if (dateType === 'yearMonth') {
        const [yearStr, monthStr] = query.split('-');
        const yearNum = parseInt(yearStr);
        const monthNum = parseInt(monthStr);
        if (!isNaN(yearNum) && !isNaN(monthNum)) {
            const count = await prisma.event.count({
                where: {
                    AND: [
                        getBrowsableEventsWhere(),
                        { year: yearNum, month: monthNum }
                    ]
                }
            });
            if (count > 0) {
                // Format: "March 1997 (4 shows)"
                const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
                suggestions.push({
                    type: 'yearMonth',
                    value: `${yearNum}-${monthStr}`,
                    label: `${monthName} ${yearNum} (${count} shows)`
                });
            }
        }
    } else if (dateType === 'date') {
        const [yearStr, monthStr, dayStr] = query.split('-');
        const yearNum = parseInt(yearStr);
        const monthNum = parseInt(monthStr);
        const dayNum = parseInt(dayStr);
        if (!isNaN(yearNum) && !isNaN(monthNum) && !isNaN(dayNum)) {
            const event = await prisma.event.findFirst({
                where: {
                    AND: [
                        getBrowsableEventsWhere(),
                        { year: yearNum, month: monthNum, day: dayNum }
                    ]
                }
            });
            if (event) {
                // Format: "March 2, 1997"
                const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', { month: 'long' });
                suggestions.push({
                    type: 'date',
                    value: `${yearNum}-${monthStr}-${dayStr}`,
                    label: `${monthName} ${dayNum}, ${yearNum}`
                });
            }
        }
    } else {
        // 2. Text: venue/city/state
        // Venue names
        const venues = await prisma.venue.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { city: { contains: query, mode: 'insensitive' } },
                    { stateProvince: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 10,
        });


        for (const v of venues) {
            const count = await prisma.event.count({
                where: {
                    AND: [
                        getBrowsableEventsWhere(),
                        { venueId: v.id }
                    ]
                }
            });
            if (count > 0) {
                suggestions.push({
                    type: 'venue',
                    value: v.name,
                    label: `${v.name}, ${v.city}${v.stateProvince ? ', ' + v.stateProvince : ''}`
                });
                if (v.city) {
                    suggestions.push({
                        type: 'city',
                        value: v.city,
                        label: `${v.city}${v.stateProvince ? ', ' + v.stateProvince : ''} (${count} shows)`
                    });
                }
                if (v.stateProvince) {
                    suggestions.push({
                        type: 'state',
                        value: v.stateProvince,
                        label: `${v.stateProvince} (${count} shows)`
                    });
                }
            }

            if (suggestions.length >= 20) break;

        }

        // 3. Band + Musician combined search
        const nameQuery: Prisma.StringFilter = {
            contains: query,
            mode: 'insensitive'
        };
        const [bands, musicians] = await Promise.all([
            prisma.band.findMany({
                where: { name: nameQuery },
                take: 10,
            }),
            prisma.musician.findMany({
                where: { name: nameQuery },
                take: 10,
            })
        ]);

        // Group by name (case-insensitive)
        const nameMap = new Map<string, { bands: any[], musicians: any[] }>();

        for (const band of bands) {
            const key = band.name.toLowerCase();
            if (!nameMap.has(key)) nameMap.set(key, { bands: [], musicians: [] });
            nameMap.get(key)!.bands.push(band);
        }

        for (const musician of musicians) {
            const key = musician.name.toLowerCase();
            if (!nameMap.has(key)) nameMap.set(key, { bands: [], musicians: [] });
            nameMap.get(key)!.musicians.push(musician);
        }

        for (const [name, { bands, musicians }] of nameMap) {
            const bandIds = bands.map(b => b.id);
            const musicianIds = musicians.map(m => m.id);
            const displayName = bands[0]?.name || musicians[0]?.name;

            const totalCount = await prisma.event.count({
                where: {
                    AND: [
                        getBrowsableEventsWhere(),
                        {
                            OR: [
                                ...(bandIds.length > 0 ? [{ primaryBandId: { in: bandIds } }] : []),
                                ...(musicianIds.length > 0 ? [
                                    { eventMusicians: { some: { musicianId: { in: musicianIds } } } },
                                    { sets: { some: { setMusicians: { some: { musicianId: { in: musicianIds } } } } } },
                                    { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: { in: musicianIds } } } } } } } },
                                    { primaryBand: { bandMusicians: { some: { musicianId: { in: musicianIds } } } } }
                                ] : [])
                            ]
                        }
                    ]
                }
            });

            if (totalCount === 0) continue;

            suggestions.push({
                type: 'person-all',
                value: displayName,
                label: `${displayName} (${totalCount} appearances)`,
                bandIds,
                musicianIds
            });

            const asPrimaryBand = bandIds.length > 0 ? await prisma.event.count({
                where: {
                    AND: [
                        getBrowsableEventsWhere(),
                        { primaryBandId: { in: bandIds } }
                    ]
                }
            }) : 0;

            if (asPrimaryBand > 0) {
                const bandLabel = displayName.toLowerCase().endsWith('band')
                    ? displayName
                    : `${displayName} Band`;

                suggestions.push({
                    type: 'band',
                    value: displayName,
                    label: `${bandLabel} (${asPrimaryBand})`,
                    bandId: bandIds[0]
                });
            }

            if (musicianIds.length > 0) {
                const bandMemberships = await prisma.bandMusician.findMany({
                    where: { musicianId: { in: musicianIds } },
                    include: { band: true }
                });

                for (const bm of bandMemberships) {
                    const bandShowCount = await prisma.event.count({
                        where: {
                            AND: [
                                getBrowsableEventsWhere(),
                                {
                                    primaryBandId: bm.band.id,
                                    primaryBand: { bandMusicians: { some: { musicianId: bm.musicianId } } }
                                }
                            ]
                        }
                    });

                    if (bandShowCount > 0) {
                        suggestions.push({
                            type: 'person-band',
                            value: displayName,
                            label: `${displayName} with ${bm.band.name} (${bandShowCount})`,
                            bandId: bm.band.id,
                            musicianId: bm.musicianId
                        });
                    }
                }

                const guestCount = await prisma.event.count({
                    where: {
                        AND: [
                            getBrowsableEventsWhere(),
                            {
                                OR: [
                                    { eventMusicians: { some: { musicianId: { in: musicianIds } } } },
                                    { sets: { some: { setMusicians: { some: { musicianId: { in: musicianIds } } } } } },
                                    { sets: { some: { performances: { some: { performanceMusicians: { some: { musicianId: { in: musicianIds } } } } } } } }
                                ]
                            }
                        ]
                    }
                });

                if (guestCount > 0) {
                    suggestions.push({
                        type: 'person-guest',
                        value: displayName,
                        label: `${displayName} guest (${guestCount})`,
                        musicianIds
                    });
                }
            }
        }
    }

    // Limit to 10 suggestions, filter out duplicates
    const unique = [];
    const seen = new Set();
    for (const s of suggestions) {
        const key = s.type === 'person-band'
            ? `${s.type}:${s.value}:${s.bandId}`
            : `${s.type}:${s.value}`;
        if (!seen.has(key)) {
            unique.push(s);
            seen.add(key);
        }
        if (unique.length >= 10) break;
    }

    return NextResponse.json({ suggestions: unique });
}