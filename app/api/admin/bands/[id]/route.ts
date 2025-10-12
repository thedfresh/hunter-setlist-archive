import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const band = await prisma.band.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } },
        });
        if (!band) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(band);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch band' }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const { name, publicNotes, privateNotes } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const updated = await prisma.band.update({
            where: { id },
            data: {
                name: name.trim(),
                publicNotes: publicNotes?.trim() || null,
                privateNotes: privateNotes?.trim() || null,
            },
        });
        revalidatePath('/admin/bands');
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update band' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const band = await prisma.band.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } },
        });
        if (!band) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (band._count.events > 0) {
            return NextResponse.json({ error: `Cannot delete - has ${band._count.events} shows in archive` }, { status: 400 });
        }
        await prisma.band.delete({ where: { id } });
        revalidatePath('/admin/bands');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete band' }, { status: 500 });
    }
}
