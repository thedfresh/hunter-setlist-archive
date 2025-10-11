import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    const setType = await prisma.setType.findUnique({
        where: { id },
        include: { _count: { select: { sets: true } } }
    });
    if (!setType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(setType);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    try {
        const body = await request.json();
        const name = (body.name || '').trim();
        const displayName = (body.displayName || '').trim();
        const includeInStats = body.includeInStats !== undefined ? !!body.includeInStats : true;
        if (!name || !displayName) {
            return NextResponse.json({ error: 'Name and Display Name are required.' }, { status: 400 });
        }
        const setType = await prisma.setType.update({
            where: { id },
            data: { name, displayName, includeInStats }
        });
        revalidatePath('/admin/set-types');
        return NextResponse.json(setType);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update set type.' }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    try {
        const setType = await prisma.setType.findUnique({
            where: { id },
            include: { _count: { select: { sets: true } } }
        });
        if (!setType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (setType._count.sets > 0) {
            return NextResponse.json({ error: `Cannot delete - used by ${setType._count.sets} sets.` }, { status: 400 });
        }
        await prisma.setType.delete({ where: { id } });
        revalidatePath('/admin/set-types');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete set type.' }, { status: 500 });
    }
}
