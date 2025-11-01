import { NextResponse } from "next/server";
import { compareMusicianNames } from '@/lib/utils/musicianSort';
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const musicians = await prisma.musician.findMany({
            include: {
                _count: { select: { eventMusicians: true, performanceMusicians: true, bandMusicians: true } }
            },
        });
        musicians.sort(compareMusicianNames);
        return NextResponse.json({ musicians });
    } catch (error) {
        const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to fetch musicians';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
