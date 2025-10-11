import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = (body.name || '').trim();
        const includeInStats = body.includeInStats !== undefined ? !!body.includeInStats : true;
        if (!name) {
            return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        }
        const eventType = await prisma.eventType.create({
            data: { name, includeInStats }
        });
        revalidatePath('/admin/event-types');
        return NextResponse.json(eventType, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create event type.' }, { status: 500 });
    }
}
