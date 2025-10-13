import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = Number(params.id);
    if (!id) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    try {
        await prisma.instrument.delete({ where: { id } });
        revalidatePath('/api/musicians')
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete instrument' }, { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        const instrument = await prisma.instrument.findUnique({ where: { id } });
        if (!instrument) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(instrument);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}