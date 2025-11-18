import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

export async function PUT(req: Request, { params }: { params: { id: string; musicianId: string } }) {
    try {
        const performanceMusicianId = Number(params.musicianId);
        if (!performanceMusicianId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const body = await req.json();
        const { instrumentIds, publicNotes, privateNotes } = body;
        if (!Array.isArray(instrumentIds) || instrumentIds.length === 0) {
            return NextResponse.json({ error: 'instrumentIds required' }, { status: 400 });
        }
        // Update PerformanceMusician
        await prisma.performanceMusician.update({
            where: { id: performanceMusicianId },
            data: {
                publicNotes,
                privateNotes,
            }
        });
        // Delete existing instrument links
        await prisma.performanceMusicianInstrument.deleteMany({ where: { performanceMusicianId } });
        // Create new instrument links
        for (const instrumentId of instrumentIds) {
            await prisma.performanceMusicianInstrument.create({
                data: {
                    performanceMusicianId,
                    instrumentId,
                }
            });
        }
        // Fetch updated record with instruments included
        const updated = await prisma.performanceMusician.findUnique({
            where: { id: performanceMusicianId },
            include: {
                instruments: {
                    include: {
                        instrument: {
                            select: {
                                id: true,
                                displayName: true,
                            }
                        }
                    }
                }
            }
        });
        revalidateAll();
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; musicianId: string } }) {
    try {
        const performanceMusicianId = Number(params.musicianId);
        if (!performanceMusicianId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        await prisma.performanceMusician.delete({ where: { id: performanceMusicianId } });
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
