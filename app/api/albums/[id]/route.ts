import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        const album = await prisma.album.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { songAlbums: true }
                }
            }
        });
        if (!album) {
            return NextResponse.json({ error: "Album not found" }, { status: 404 });
        }
        return NextResponse.json({ album });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "Failed to fetch album" }, { status: 500 });
    }
}