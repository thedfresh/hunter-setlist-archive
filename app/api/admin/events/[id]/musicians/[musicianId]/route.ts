import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: { id: string; musicianId: string } }) {
    const eventId = Number(params.id);
    const musicianId = Number(params.musicianId);
    if (!eventId || !musicianId) return NextResponse.json({ error: 'Invalid eventId or musicianId' }, { status: 400 });
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { instrumentId, publicNotes, privateNotes } = body;
    try {
        const existing = await prisma.eventMusician.findFirst({ where: { eventId, musicianId } });
        if (!existing) return NextResponse.json({ error: 'EventMusician not found' }, { status: 404 });
        const updated = await prisma.eventMusician.update({
            where: { id: existing.id },
            data: { instrumentId, publicNotes, privateNotes },
        });
        revalidatePath('/admin/events');
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update event musician' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; musicianId: string } }) {
    const eventId = Number(params.id);
    const musicianId = Number(params.musicianId);
    if (!eventId || !musicianId) return NextResponse.json({ error: 'Invalid eventId or musicianId' }, { status: 400 });
    try {
        const existing = await prisma.eventMusician.findFirst({ where: { eventId, musicianId } });
        if (!existing) return NextResponse.json({ error: 'EventMusician not found' }, { status: 404 });
        await prisma.eventMusician.delete({ where: { id: existing.id } });
        revalidatePath('/admin/events');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete event musician' }, { status: 500 });
    }
}
