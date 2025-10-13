import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils/eventSlug";

export async function POST(req: Request) {
    try {
        const body = await req.json();
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

        // Generate sortDate
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

        // Create event
        const event = await prisma.event.create({
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

        revalidatePath("/admin/events");
        revalidatePath("/event");

        return NextResponse.json({ event }, { status: 201 });

    } catch (err: any) {
        if (err.code === "P2002") {
            return NextResponse.json({ error: "Event with this date/venue combination already exists" }, { status: 400 });
        }
        console.error("POST /api/admin/events error:", err);
        return NextResponse.json({ error: err?.message || "Failed to create event" }, { status: 500 });
    }
}