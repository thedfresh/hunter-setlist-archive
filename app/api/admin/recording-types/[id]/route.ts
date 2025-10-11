import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const recordingType = await prisma.recordingType.findUnique({
            where: { id },
            include: { _count: { select: { recordings: true } } },
        });
        if (!recordingType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(recordingType);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch recording type' }, { status: 500 });
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
        const updated = await prisma.recordingType.update({
            where: { id },
            data: { name: name.trim(), description: description?.trim() || null },
        });
        revalidatePath('/admin/recording-types');
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update recording type' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        const recordingType = await prisma.recordingType.findUnique({
            where: { id },
            include: { _count: { select: { recordings: true } } },
        });
        if (!recordingType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (recordingType._count.recordings > 0) {
            return NextResponse.json({ error: `Cannot delete - used by ${recordingType._count.recordings} recordings` }, { status: 400 });
        }
        await prisma.recordingType.delete({ where: { id } });
        revalidatePath('/admin/recording-types');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete recording type' }, { status: 500 });
    }
}
