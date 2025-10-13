import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    if (!eventId) return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    try {
        const eventMusicians = await prisma.eventMusician.findMany({
            where: { eventId },
            include: {
                musician: { select: { name: true } },
                instrument: { select: { displayName: true } },
            },
            orderBy: [{ musician: { name: 'asc' } }],
        });
        return NextResponse.json({ eventMusicians });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch event musicians' }, { status: 500 });
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
    const { musicianId, instrumentId, publicNotes, privateNotes } = body;
    if (!musicianId || typeof musicianId !== 'number') {
        return NextResponse.json({ error: 'musicianId is required and must be a number' }, { status: 400 });
    }
    try {
        const eventMusician = await prisma.eventMusician.create({
            data: {
                eventId,
                musicianId,
                instrumentId,
                publicNotes,
                privateNotes,
            },
        });
        revalidatePath('/admin/events');
        return NextResponse.json(eventMusician, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create event musician' }, { status: 500 });
    }
}
