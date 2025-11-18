import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

export async function PUT(req: Request, { params }: { params: { id: string; banterId: string } }) {
    const eventId = Number(params.id);
    const banterId = Number(params.banterId);
    if (!eventId || !banterId) return NextResponse.json({ error: 'Invalid eventId or banterId' }, { status: 400 });
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { performanceId, banterText, isBeforeSong, isVerbatim, publicNotes, privateNotes } = body;
    if (!performanceId || !banterText) {
        return NextResponse.json({ error: 'performanceId and banterText are required' }, { status: 400 });
    }
    try {
        const showBanter = await prisma.showBanter.update({
            where: { id: banterId },
            data: {
                performanceId,
                banterText,
                isBeforeSong,
                isVerbatim,
                publicNotes,
                privateNotes,
            },
        });
        revalidateAll();
        return NextResponse.json(showBanter);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update show banter' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; banterId: string } }) {
    const eventId = Number(params.id);
    const banterId = Number(params.banterId);
    if (!eventId || !banterId) return NextResponse.json({ error: 'Invalid eventId or banterId' }, { status: 400 });
    try {
        await prisma.showBanter.delete({
            where: { id: banterId },
        });
        revalidateAll();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete show banter' }, { status: 500 });
    }
}
