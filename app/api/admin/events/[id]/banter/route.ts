import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    if (!eventId) return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    try {
        // Get all performances for this event
        const performances = await prisma.performance.findMany({
            where: { set: { eventId } },
            select: { id: true }
        });
        const performanceIds = performances.map(p => p.id);
        // Get all show banter for these performances
        const showBanter = await prisma.showBanter.findMany({
            where: { performanceId: { in: performanceIds } },
            include: {
                performance: {
                    include: {
                        song: true,
                        set: true,
                    },
                },
            },
            orderBy: [
                { performance: { set: { position: 'asc' } } },
                { performance: { performanceOrder: 'asc' } },
            ],
        });
        return NextResponse.json({ showBanter });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch show banter' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    if (!eventId) return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { performanceId, banterText, isBeforeSong, isVerbatim, publicNotes, privateNotes } = body;
    if (!performanceId || !banterText) {
        return NextResponse.json({ error: 'performanceId and banterText are required' }, { status: 400 });
    }
    try {
        const showBanter = await prisma.showBanter.create({
            data: {
                performanceId,
                banterText,
                isBeforeSong,
                isVerbatim,
                publicNotes,
                privateNotes,
            },
        });
        revalidatePath('/admin/events');
        return NextResponse.json(showBanter, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create show banter' }, { status: 500 });
    }
}
