import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const eventTypes = await prisma.eventType.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { events: true } }
            }
        });
        return NextResponse.json({ eventTypes });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch event types.' }, { status: 500 });
    }
}
