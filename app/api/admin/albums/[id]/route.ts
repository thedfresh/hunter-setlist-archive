import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const album = await prisma.album.findUnique({
            where: { id },
            include: { _count: { select: { songAlbums: true } } },
        });
        if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(album);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch album' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const { title, artist, releaseYear, isOfficial = true, publicNotes, privateNotes } = await req.json();
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const updated = await prisma.album.update({
            where: { id },
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
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update album' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const album = await prisma.album.findUnique({
            where: { id },
            include: { _count: { select: { songAlbums: true } } },
        });
        if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (album._count.songAlbums > 0) {
            return NextResponse.json({ error: `Cannot delete - has ${album._count.songAlbums} tracks assigned` }, { status: 400 });
        }
        await prisma.album.delete({ where: { id } });
        revalidatePath('/admin/albums');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete album' }, { status: 500 });
    }
}
