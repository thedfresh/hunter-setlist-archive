import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const tag = await prisma.tag.findUnique({
            where: { id },
            include: { _count: { select: { songTags: true } } },
        });
        if (!tag) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(tag);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch tag' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const { name, description } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        try {
            const updated = await prisma.tag.update({
                where: { id },
                data: { name: name.trim(), description: description?.trim() || null },
            });
            revalidatePath('/admin/tags');
            return NextResponse.json(updated);
        } catch (err: any) {
            if (err?.code === 'P2002') {
                return NextResponse.json({ error: 'Tag name must be unique' }, { status: 400 });
            }
            throw err;
        }
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update tag' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const tag = await prisma.tag.findUnique({
            where: { id },
            include: { _count: { select: { songTags: true } } },
        });
        if (!tag) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (tag._count.songTags > 0) {
            return NextResponse.json({ error: `Cannot delete - used by ${tag._count.songTags} songs` }, { status: 400 });
        }
        await prisma.tag.delete({ where: { id } });
        revalidatePath('/admin/tags');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete tag' }, { status: 500 });
    }
}
