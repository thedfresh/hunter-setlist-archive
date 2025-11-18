import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const performanceId = Number(params.id);
    if (!performanceId) {
        return NextResponse.json({ error: 'Invalid performance ID' }, { status: 400 });
    }
    const vocalists = await prisma.performanceVocalist.findMany({
        where: { performanceId },
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
}
