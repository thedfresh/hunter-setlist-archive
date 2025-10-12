import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateSlugFromName } from "@/lib/utils/generateSlug";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, slug, alternateTitle, originalArtist, lyricsBy, musicBy, isUncertain = false, inBoxOfRain = false, publicNotes, privateNotes } = body;
        if (!title || typeof title !== "string" || title.trim() === "") {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }
        const finalSlug = slug?.trim() || generateSlugFromName(title);
        try {
            const song = await prisma.song.create({
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
            return NextResponse.json(song, { status: 201 });
        } catch (error: any) {
            if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
                return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
            }
            return NextResponse.json({ error: error?.message || 'Failed to create song' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create song' }, { status: 500 });
    }
}
