import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const eventId = parseInt(params.id);

        if (isNaN(eventId)) {
            return NextResponse.json(
                { error: "Invalid event ID" },
                { status: 400 }
            );
        }

        // Get current event's sortDate
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { sortDate: true }
        });

        if (!event || !event.sortDate) {
            return NextResponse.json({ prevEvent: null, nextEvent: null });
        }

        // Get prev/next events (ALL events for admin)
        const [prevEvent, nextEvent] = await Promise.all([
            prisma.event.findFirst({
                where: { sortDate: { lt: event.sortDate } },
                orderBy: { sortDate: 'desc' },
                select: { id: true, slug: true, year: true, month: true, day: true, showTiming: true, displayDate: true }
            }),
            prisma.event.findFirst({
                where: { sortDate: { gt: event.sortDate } },
                orderBy: { sortDate: 'asc' },
                select: { id: true, slug: true, year: true, month: true, day: true, showTiming: true, displayDate: true }
            })
        ]);

        return NextResponse.json({ prevEvent, nextEvent });
    } catch (error) {
        console.error("Error fetching navigation:", error);
        return NextResponse.json(
            { error: "Failed to fetch navigation" },
            { status: 500 }
        );
    }
}