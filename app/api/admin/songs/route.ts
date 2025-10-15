import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveSlugCollision } from '@/lib/utils/generateSlug';
import { revalidatePath } from "next/cache";
import { generateSlugFromName } from "@/lib/utils/generateSlug";

export async function POST(req: Request) {
    const body = await req.json();
    const { title, ...rest } = body;
    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const slug = generateSlugFromName(title);
    let song;
    try {
        song = await prisma.song.create({
            data: {
                title,
                slug,
                ...rest
            }
        });
    } catch (err: any) {
        if (err.code === 'P2002') {
            const resolvedSlug = await resolveSlugCollision(slug, 'songs');
            song = await prisma.song.create({
                data: {
                    title,
                    slug: resolvedSlug,
                    ...rest
                }
            });
        } else {
            console.error('POST /api/admin/songs error:', err);
            return NextResponse.json({ error: err?.message || 'Failed to create song' }, { status: 500 });
        }
    }
    revalidatePath('/admin/songs');
    return NextResponse.json({ song }, { status: 201 });
}
