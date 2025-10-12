import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const { name, slug, isUncertain = false, publicNotes, privateNotes } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const musician = await prisma.musician.create({
            data: {
                name: name.trim(),
                slug: slug?.trim() || null,
                isUncertain: typeof isUncertain === 'boolean' ? isUncertain : false,
                publicNotes: publicNotes?.trim() || null,
                privateNotes: privateNotes?.trim() || null,
            },
        });
        revalidatePath('/admin/musicians');
        return NextResponse.json(musician, { status: 201 });
    } catch (error: any) {
        if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }
        return NextResponse.json({ error: error?.message || 'Failed to create musician' }, { status: 500 });
    }
}
