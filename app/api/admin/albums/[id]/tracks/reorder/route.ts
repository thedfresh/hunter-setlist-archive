import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const albumId = Number(params.id);
        if (!albumId) return NextResponse.json({ error: 'Invalid album id' }, { status: 400 });
        const body = await req.json();
        const trackIds: number[] = Array.isArray(body.trackIds) ? body.trackIds.map(Number) : [];
        if (!trackIds.length) return NextResponse.json({ error: 'trackIds array required' }, { status: 400 });

        const updatePromises = trackIds.map((trackId, idx) =>
            prisma.songAlbum.update({
                where: { id: trackId },
                data: { trackNumber: idx + 1 }
            })
        );
        await prisma.$transaction(updatePromises);
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to reorder tracks' }, { status: 500 });
    }
}
