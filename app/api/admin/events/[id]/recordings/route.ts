import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    if (!eventId) return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    try {
        const recordings = await prisma.recording.findMany({
            where: { eventId },
            include: {
                recordingType: { select: { name: true } },
            },
            orderBy: [{ id: 'asc' }],
        });
        return NextResponse.json({ recordings });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch recordings' }, { status: 500 });
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
    const { recordingTypeId, description, taper, lmaIdentifier, losslessLegsId, youtubeVideoId, shnId, lengthMinutes, featured, featuredText, publicNotes, privateNotes } = body;
    if (!recordingTypeId) {
        return NextResponse.json({ error: 'recordingTypeId is required' }, { status: 400 });
    }
    try {
        const recording = await prisma.recording.create({
            data: {
                eventId,
                recordingTypeId,
                description,
                taper,
                lmaIdentifier,
                losslessLegsId,
                youtubeVideoId,
                shnId,
                lengthMinutes,
                featured,
                featuredText,
                publicNotes,
                privateNotes,
            },
        });
        revalidatePath('/admin/events');
        return NextResponse.json(recording, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create recording' }, { status: 500 });
    }
}
