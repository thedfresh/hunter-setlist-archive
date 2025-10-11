import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { songTags: true } } },
        });
        return NextResponse.json({ tags });
    } catch (error) {
        const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to fetch tags';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
