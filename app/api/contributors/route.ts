import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const contributors = await prisma.contributor.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { eventContributors: true, recordings: true } } },
        });
        return NextResponse.json({ contributors });
    } catch (error) {
        const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to fetch contributors';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
