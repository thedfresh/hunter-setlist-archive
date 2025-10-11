import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, displayName } = body;
        if (!name || !displayName) {
            return NextResponse.json({ error: 'Name and displayName are required' }, { status: 400 });
        }
        const instrument = await prisma.instrument.create({
            data: { name, displayName }
        });
        revalidatePath('/api/musicians')
        return NextResponse.json(instrument, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create instrument' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const body = await request.json();
        const id = Number(body.id);
        if (!id) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        await prisma.instrument.delete({ where: { id } });
        revalidatePath('/api/musicians')
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete instrument' }, { status: 500 });
    }
}
