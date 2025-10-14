import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: { id: string; musicianId: string } }) {
    try {
        const performanceMusicianId = Number(params.musicianId);
        if (!performanceMusicianId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const body = await req.json();
        const { instrumentId, publicNotes, privateNotes } = body;
        const updated = await prisma.performanceMusician.update({
            where: { id: performanceMusicianId },
            data: { instrumentId, publicNotes, privateNotes }
        });
        revalidatePath('/admin/events');
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
        revalidatePath('/admin/events');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
