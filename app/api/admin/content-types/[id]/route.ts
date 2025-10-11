import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const contentType = await prisma.contentType.findUnique({
        where: { id },
        include: { _count: { select: { events: true } } }
    });
    if (!contentType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(contentType);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    try {
        const body = await request.json();
        const name = (body.name || '').trim();
        if (!name) {
            return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        }
        const contentType = await prisma.contentType.update({
            where: { id },
            data: { name }
        });
        revalidatePath('/admin/content-types');
        return NextResponse.json(contentType);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update content type.' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    try {
        const contentType = await prisma.contentType.findUnique({
            where: { id },
            include: { _count: { select: { events: true } } }
        });
        if (!contentType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (contentType._count.events > 0) {
            return NextResponse.json({ error: `Cannot delete - used by ${contentType._count.events} events.` }, { status: 400 });
        }
        await prisma.contentType.delete({ where: { id } });
        revalidatePath('/admin/content-types');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete content type.' }, { status: 500 });
    }
}
