import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const linkType = await prisma.linkType.findUnique({
            where: { id },
            include: { _count: { select: { links: true } } },
        });
        if (!linkType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(linkType);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch link type' }, { status: 500 });
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
        const updated = await prisma.linkType.update({
            where: { id },
            data: { name: name.trim(), description: description?.trim() || null },
        });
        revalidatePath('/admin/link-types');
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update link type' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const linkType = await prisma.linkType.findUnique({
            where: { id },
            include: { _count: { select: { links: true } } },
        });
        if (!linkType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (linkType._count.links > 0) {
            return NextResponse.json({ error: `Cannot delete - used by ${linkType._count.links} links` }, { status: 400 });
        }
        await prisma.linkType.delete({ where: { id } });
        revalidatePath('/admin/link-types');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete link type' }, { status: 500 });
    }
}
