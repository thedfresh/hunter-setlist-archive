import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const songId = Number(params.id);
    if (!songId) {
        return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 });
    }
    try {
        const vocalists = await prisma.songVocalist.findMany({
            where: { songId },
            include: {
                musician: {
                    select: {
                        id: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });
        return NextResponse.json({ vocalists });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch vocalists' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const songId = Number(params.id);
    if (!songId) {
        return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 });
    }
    try {
        const body = await req.json();
        const vocalistData = Array.isArray(body.vocalistData) ? body.vocalistData : [];
        await prisma.songVocalist.deleteMany({ where: { songId } });
        for (const item of vocalistData) {
            if (!item.musicianId || !item.vocalRole) continue;
            await prisma.songVocalist.create({
                data: {
                    songId,
                    musicianId: item.musicianId,
                    vocalRole: item.vocalRole,
                }
            });
        }
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to save vocalists' }, { status: 500 });
    }
}
