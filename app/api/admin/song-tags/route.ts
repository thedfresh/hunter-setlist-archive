import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    try {
        const { songId, tagId } = await req.json();

        if (!songId || !tagId) {
            return NextResponse.json({ error: 'songId and tagId required' }, { status: 400 });
        }

        const songTag = await prisma.songTag.create({
            data: { songId, tagId }
        });

        revalidatePath('/admin/songs');
        return NextResponse.json(songTag, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Tag already added to this song' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to add tag' }, { status: 500 });
    }
}