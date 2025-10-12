import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const { title, artist, releaseYear, isOfficial = true, publicNotes, privateNotes } = await req.json();
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const album = await prisma.album.create({
            data: {
                title: title.trim(),
                artist: artist?.trim() || null,
                releaseYear: releaseYear ? Number(releaseYear) : null,
                isOfficial: typeof isOfficial === 'boolean' ? isOfficial : true,
                publicNotes: publicNotes?.trim() || null,
                privateNotes: privateNotes?.trim() || null,
            },
        });
        revalidatePath('/admin/albums');
        return NextResponse.json(album, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create album' }, { status: 500 });
    }
}
