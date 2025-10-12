import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const musicians = await prisma.musician.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { eventMusicians: true, performanceMusicians: true, bandMusicians: true } } },
        });
        return NextResponse.json({ musicians });
    } catch (error) {
        const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to fetch musicians';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
