import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const performanceId = Number(params.id);
        if (!performanceId) return NextResponse.json({ error: 'Invalid performanceId' }, { status: 400 });
        const performanceMusicians = await prisma.performanceMusician.findMany({
            where: { performanceId },
            include: {
                musician: { select: { name: true } },
                instrument: { select: { displayName: true } }
            },
            orderBy: { id: 'asc' }
        });
        return NextResponse.json({ performanceMusicians });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const performanceId = Number(params.id);
        if (!performanceId) return NextResponse.json({ error: 'Invalid performanceId' }, { status: 400 });
        const body = await req.json();
        const { musicianId, instrumentId, publicNotes, privateNotes } = body;
        if (!musicianId) return NextResponse.json({ error: 'musicianId required' }, { status: 400 });
        const pm = await prisma.performanceMusician.create({
            data: { performanceId, musicianId, instrumentId, publicNotes, privateNotes }
        });
        revalidatePath('/admin/events');
        return NextResponse.json(pm, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
