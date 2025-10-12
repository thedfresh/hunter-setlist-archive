import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateSlugFromName } from "@/lib/utils/generateSlug";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const song = await prisma.song.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        performances: true,
                        songAlbums: true,
                        songTags: true,
                    }
                },
                songAlbums: true,
                songTags: true,
            },
        });
        if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(song);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch song' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const body = await req.json();
        const { title, slug, alternateTitle, originalArtist, lyricsBy, musicBy, isUncertain = false, inBoxOfRain = false, publicNotes, privateNotes } = body;
        if (!title || typeof title !== "string" || title.trim() === "") {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }
        const finalSlug = slug?.trim() || generateSlugFromName(title);
        try {
            const updated = await prisma.song.update({
                where: { id },
                data: {
                    title: title.trim(),
                    slug: finalSlug,
                    alternateTitle: alternateTitle?.trim() || null,
                    originalArtist: originalArtist?.trim() || null,
                    lyricsBy: lyricsBy?.trim() || null,
                    musicBy: musicBy?.trim() || null,
                    isUncertain: !!isUncertain,
                    inBoxOfRain: !!inBoxOfRain,
                    publicNotes: publicNotes?.trim() || null,
                    privateNotes: privateNotes?.trim() || null,
                },
            });
            revalidatePath('/admin/songs');
            return NextResponse.json(updated);
        } catch (error: any) {
            if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
                return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
            }
            return NextResponse.json({ error: error?.message || 'Failed to update song' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update song' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const song = await prisma.song.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        performances: true,
                        songAlbums: true,
                        songTags: true,
                    }
                }
            },
        });
        if (!song) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const totalUsage = (song._count.performances ?? 0) + (song._count.songAlbums ?? 0) + (song._count.songTags ?? 0);
        if (totalUsage > 0) {
            return NextResponse.json({ error: `Cannot delete - has ${totalUsage} usages` }, { status: 400 });
        }
        await prisma.song.delete({ where: { id } });
        revalidatePath('/admin/songs');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete song' }, { status: 500 });
    }
}
