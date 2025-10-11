import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const contentTypes = await prisma.contentType.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { events: true } }
            }
        });
        return NextResponse.json({ contentTypes });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch content types.' }, { status: 500 });
    }
}
