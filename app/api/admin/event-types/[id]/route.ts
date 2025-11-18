import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const eventType = await prisma.eventType.findUnique({
        where: { id },
        include: { _count: { select: { events: true } } }
    });
    if (!eventType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(eventType);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    try {
        const body = await request.json();
        const name = (body.name || '').trim();
        const includeInStats = body.includeInStats !== undefined ? !!body.includeInStats : true;
        if (!name) {
            return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        }
        const eventType = await prisma.eventType.update({
            where: { id },
            data: { name, includeInStats }
        });
        revalidateAll();
        return NextResponse.json(eventType);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update event type.' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    try {
        const eventType = await prisma.eventType.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } }
        });
        if (!eventType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (eventType._count.events > 0) {
            return NextResponse.json({ error: `Cannot delete - used by ${eventType._count.events} events.` }, { status: 400 });
        }
        await prisma.eventType.delete({ where: { id } });
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete event type.' }, { status: 500 });
    }
}
