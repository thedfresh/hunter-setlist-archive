import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_req: Request, { params }: { params: { id: string; recordingId: string } }) {
    const recordingId = Number(params.recordingId);
    if (!recordingId) return NextResponse.json({ error: 'Invalid recordingId' }, { status: 400 });
    try {
        const recording = await prisma.recording.findUnique({
            where: { id: recordingId },
            include: { recordingType: true },
        });
        return NextResponse.json({ recording });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch recording' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string; recordingId: string } }) {
    const recordingId = Number(params.recordingId);
    if (!recordingId) return NextResponse.json({ error: 'Invalid recordingId' }, { status: 400 });
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { recordingTypeId, description, taper, lmaIdentifier, losslessLegsId, youtubeVideoId, shnId, lengthMinutes, featured, featuredText, publicNotes, privateNotes } = body;
    try {
        const recording = await prisma.recording.update({
            where: { id: recordingId },
            data: {
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
        revalidateAll();
        return NextResponse.json(recording);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update recording' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; recordingId: string } }) {
    const recordingId = Number(params.recordingId);
    if (!recordingId) return NextResponse.json({ error: 'Invalid recordingId' }, { status: 400 });
    try {
        await prisma.recording.delete({
            where: { id: recordingId },
        });
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete recording' }, { status: 500 });
    }
}
