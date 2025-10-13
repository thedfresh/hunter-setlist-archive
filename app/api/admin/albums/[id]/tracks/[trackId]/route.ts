import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: { id: string; trackId: string } }) {
    try {
        const trackId = Number(params.trackId);
        if (!trackId) return NextResponse.json({ error: 'Invalid track id' }, { status: 400 });
        const body = await req.json();
        const trackNumber = Number(body.trackNumber);
        if (!trackNumber) return NextResponse.json({ error: 'trackNumber is required' }, { status: 400 });
        const updated = await prisma.songAlbum.update({
            where: { id: trackId },
            data: { trackNumber }
        });
        revalidatePath('/admin/albums');
        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to update track' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; trackId: string } }) {
    try {
        const trackId = Number(params.trackId);
        const albumId = Number(params.id);
        if (!trackId || !albumId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        // Get the track to know its trackNumber
        const track = await prisma.songAlbum.findUnique({ where: { id: trackId } });
        if (!track) return NextResponse.json({ error: 'Track not found' }, { status: 404 });
        const deleted = await prisma.songAlbum.delete({ where: { id: trackId } });
        // Renumber remaining tracks
        await prisma.songAlbum.updateMany({
            where: {
                albumId,
                trackNumber: { gt: typeof track.trackNumber === 'number' ? track.trackNumber : 0 }
            },
            data: {
                trackNumber: { decrement: 1 }
            }
        });
        revalidatePath('/admin/albums');
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to delete track' }, { status: 500 });
    }
}
