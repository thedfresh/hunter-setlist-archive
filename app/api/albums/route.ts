import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const albums = await prisma.album.findMany({
            orderBy: { title: 'asc' },
            include: { _count: { select: { songAlbums: true } } },
        });
        return NextResponse.json({ albums });
    } catch (error) {
        const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to fetch albums';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
