import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const albumId = Number(params.id);
        if (!albumId) return NextResponse.json({ error: 'Invalid album id' }, { status: 400 });
        const tracks = await prisma.songAlbum.findMany({
            where: { albumId },
            orderBy: { trackNumber: 'asc' },
            include: {
                song: {
                    select: { id: true, title: true }
                }
            }
        });
        return NextResponse.json({ tracks });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to fetch tracks' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const albumId = Number(params.id);
        if (!albumId) return NextResponse.json({ error: 'Invalid album id' }, { status: 400 });
        const body = await req.json();
        const songId = Number(body.songId);
        let trackNumber = body.trackNumber ? Number(body.trackNumber) : undefined;
        if (!songId) return NextResponse.json({ error: 'songId is required' }, { status: 400 });

        // Check for duplicate
        const existing = await prisma.songAlbum.findFirst({ where: { albumId, songId } });
        if (existing) {
            return NextResponse.json({ error: 'This song is already on this album' }, { status: 400 });
        }

        // Auto-assign trackNumber if not provided
        if (!trackNumber) {
            const maxTrack = await prisma.songAlbum.findFirst({
                where: { albumId },
                orderBy: { trackNumber: 'desc' },
                select: { trackNumber: true }
            });
            trackNumber = maxTrack?.trackNumber ? maxTrack.trackNumber + 1 : 1;
        }

        const created = await prisma.songAlbum.create({
            data: { albumId, songId, trackNumber }
        });
        revalidateAll();
        return NextResponse.json(created, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Failed to add track' }, { status: 500 });
    }
}
