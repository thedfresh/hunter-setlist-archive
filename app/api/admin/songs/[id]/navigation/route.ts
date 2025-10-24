import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const songId = Number(params.id);
    if (!songId) return NextResponse.json({ error: 'Invalid song id' }, { status: 400 });

    // Get current song
    const currentSong = await prisma.song.findUnique({
        where: { id: songId },
        select: { id: true, title: true, slug: true }
    });
    if (!currentSong) return NextResponse.json({ error: 'Song not found' }, { status: 404 });

    // Previous song (title < current, descending)
    const prevSong = await prisma.song.findFirst({
        where: {
            title: { lt: currentSong.title }
        },
        orderBy: { title: 'desc' },
        select: { id: true, title: true, slug: true }
    });

    // Next song (title > current, ascending)
    const nextSong = await prisma.song.findFirst({
        where: {
            title: { gt: currentSong.title }
        },
        orderBy: { title: 'asc' },
        select: { id: true, title: true, slug: true }
    });

    return NextResponse.json({ prevSong, nextSong });
}
