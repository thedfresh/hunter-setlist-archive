import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAll } from '@/lib/utils/revalidation';

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
        const { title, slug, artist, releaseYear, isOfficial = true, publicNotes, privateNotes } = await req.json();
        if (!title || typeof title !== 'string' || title.trim() === '') {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }
        const updated = await prisma.album.update({
            where: { id },
            data: {
                title: title.trim(),
                slug: slug?.trim() || null,
                artist: artist?.trim() || null,
                releaseYear: releaseYear ? Number(releaseYear) : null,
                isOfficial: typeof isOfficial === 'boolean' ? isOfficial : true,
                publicNotes: publicNotes?.trim() || null,
                privateNotes: privateNotes?.trim() || null,
            },
        });
        revalidateAll();
        return NextResponse.json(updated);
    } catch (error: any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
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
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete album' }, { status: 500 });
    }
}
