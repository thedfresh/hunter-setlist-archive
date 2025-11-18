import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const performanceId = Number(params.id);
    if (!performanceId) return NextResponse.json({ error: 'Invalid performanceId' }, { status: 400 });
    try {
        const performanceMusicians = await prisma.performanceMusician.findMany({
            where: { performanceId },
            include: {
                musician: { select: { name: true } },
                instruments: {
                    include: {
                        instrument: { select: { id: true, displayName: true } }
                    }
                }
            },
            orderBy: [{ musician: { name: 'asc' } }],
        });
        return NextResponse.json({ performanceMusicians });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch performance musicians' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const performanceId = Number(params.id);
    if (!performanceId) return NextResponse.json({ error: 'Invalid performanceId' }, { status: 400 });
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { musicianId, instrumentIds, publicNotes, privateNotes } = body;
    if (!musicianId || typeof musicianId !== 'number') {
        return NextResponse.json({ error: 'musicianId is required and must be a number' }, { status: 400 });
    }
    try {
        const performanceMusician = await prisma.performanceMusician.create({
            data: {
                performanceId,
                musicianId,
                publicNotes,
                privateNotes,
                instruments: {
                    create: (instrumentIds || []).map((instId: number) => ({
                        instrumentId: instId
                    }))
                }
            },
            include: {
                instruments: {
                    include: {
                        instrument: true
                    }
                }
            }
        });

        const performance = await prisma.performance.findUnique({
            where: { id: performanceId },
            include: { set: { include: { event: true } } }
        });

        if (performance?.set?.event) {
            revalidatePath('/admin/events');
            revalidatePath(`/admin/events/${performance.set.event.id}`);
            revalidatePath('/event', 'page');
        }

        return NextResponse.json(performanceMusician, { status: 201 });
    } catch (error: any) {
        console.error('PerformanceMusician error:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create performance musician' }, { status: 500 });
    }
}