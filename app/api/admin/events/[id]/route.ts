import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils/eventSlug";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const idOrSlug = params.id;
        const isNumeric = !isNaN(Number(idOrSlug));

        const event = await prisma.event.findUnique({
            where: isNumeric ? { id: Number(idOrSlug) } : { slug: idOrSlug },
            include: {
                venue: true,
                eventType: true,
                contentType: true,
                primaryBand: true,
                sets: {
                    include: {
                        setType: true,
                        performances: {
                            include: {
                                song: true
                            },
                            orderBy: { performanceOrder: 'asc' }
                        }
                    },
                    orderBy: { position: 'asc' }
                }
            }
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({ event });

    } catch (err: any) {
        console.error("GET /api/admin/events/[id] error:", err);
        return NextResponse.json({ error: err?.message || "Failed to fetch event" }, { status: 500 });
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const params = await context.params;
    const eventId = parseInt(params.id);
    const body = await request.json();
    const {
        year, month, day, displayDate, showTiming, venueId, eventTypeId,
        contentTypeId, primaryBandId, billing, etreeShowId, publicNotes,
        privateNotes, rawData, rawDataGdsets, dateUncertain, venueUncertain,
        hunterParticipationUncertain, isUncertain, isPublic, verified
    } = body;

    // Validate required fields
    if (!year || isNaN(Number(year))) {
        return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
    }

    // Generate slug
    const slug = generateSlug({ year, month, day, showTiming });

    // Calculate sortDate
    let hour = 20;
    if (showTiming?.toLowerCase() === 'late') hour = 22;
    if (showTiming?.toLowerCase() === 'early') hour = 18;

    let sortDate;
    if (year && month && day) {
        sortDate = new Date(Date.UTC(year, month - 1, day, hour, 0));
    } else if (year && month) {
        sortDate = new Date(Date.UTC(year, month - 1, 1, hour, 0));
    } else if (year) {
        sortDate = new Date(Date.UTC(year, 0, 1, hour, 0));
    }

    let event;
    try {
        event = await prisma.event.update({
            where: { id: eventId },
            data: {
                year: Number(year),
                month: month ? Number(month) : null,
                day: day ? Number(day) : null,
                displayDate,
                showTiming,
                slug,
                sortDate,
                venueId: venueId ? Number(venueId) : null,
                eventTypeId: eventTypeId ? Number(eventTypeId) : null,
                contentTypeId: contentTypeId ? Number(contentTypeId) : null,
                primaryBandId: primaryBandId ? Number(primaryBandId) : null,
                billing,
                etreeShowId: etreeShowId ? String(etreeShowId) : null,
                publicNotes,
                privateNotes,
                rawData,
                rawDataGdsets,
                dateUncertain: Boolean(dateUncertain),
                venueUncertain: Boolean(venueUncertain),
                hunterParticipationUncertain: Boolean(hunterParticipationUncertain),
                isUncertain: Boolean(isUncertain),
                isPublic: Boolean(isPublic),
                verified: Boolean(verified)
            }
        });
    } catch (err: any) {
        if (err.code === "P2002") {
            const { resolveSlugCollision } = await import("@/lib/utils/generateSlug");
            const resolvedSlug = await resolveSlugCollision(slug, 'events', eventId);
            event = await prisma.event.update({
                where: { id: eventId },
                data: {
                    year: Number(year),
                    month: month ? Number(month) : null,
                    day: day ? Number(day) : null,
                    displayDate,
                    showTiming,
                    slug: resolvedSlug,
                    sortDate,
                    venueId: venueId ? Number(venueId) : null,
                    eventTypeId: eventTypeId ? Number(eventTypeId) : null,
                    contentTypeId: contentTypeId ? Number(contentTypeId) : null,
                    primaryBandId: primaryBandId ? Number(primaryBandId) : null,
                    billing,
                    etreeShowId: etreeShowId ? String(etreeShowId) : null,
                    publicNotes,
                    privateNotes,
                    rawData,
                    rawDataGdsets,
                    dateUncertain: Boolean(dateUncertain),
                    venueUncertain: Boolean(venueUncertain),
                    hunterParticipationUncertain: Boolean(hunterParticipationUncertain),
                    isUncertain: Boolean(isUncertain),
                    isPublic: Boolean(isPublic),
                    verified: Boolean(verified)
                }
            });
        } else {
            console.error("PUT /api/admin/events/[id] error:", err);
            return NextResponse.json({ error: err?.message || "Failed to update event" }, { status: 500 });
        }
    }

    revalidatePath("/admin/events");
    revalidatePath("/event");

    return NextResponse.json({ event });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const idOrSlug = params.id;
        const isNumeric = !isNaN(Number(idOrSlug));

        // Find event by numeric ID or slug to get the actual ID for deletion
        let eventId;
        if (isNumeric) {
            eventId = Number(idOrSlug);
        } else {
            const event = await prisma.event.findUnique({
                where: { slug: idOrSlug },
                select: { id: true }
            });
            if (!event) {
                return NextResponse.json({ error: "Event not found" }, { status: 404 });
            }
            eventId = event.id;
        }

        // Check for related data
        const eventWithCounts = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                _count: {
                    select: {
                        sets: true,
                        recordings: true,
                        eventMusicians: true,
                        eventContributors: true
                    }
                }
            }
        });

        if (!eventWithCounts) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const { sets, recordings, eventMusicians, eventContributors } = eventWithCounts._count;
        const totalRelated = sets + recordings + eventMusicians + eventContributors;

        if (totalRelated > 0) {
            const parts = [];
            if (sets > 0) parts.push(`${sets} sets`);
            if (recordings > 0) parts.push(`${recordings} recordings`);
            if (eventMusicians > 0) parts.push(`${eventMusicians} musicians`);
            if (eventContributors > 0) parts.push(`${eventContributors} contributors`);

            return NextResponse.json({
                error: `Cannot delete - event has ${parts.join(", ")}`
            }, { status: 400 });
        }

        // Delete event
        await prisma.event.delete({ where: { id: eventId } });

        revalidatePath("/admin/events");
        revalidatePath("/event");

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("DELETE /api/admin/events/[id] error:", err);
        return NextResponse.json({ error: err?.message || "Failed to delete event" }, { status: 500 });
    }
}