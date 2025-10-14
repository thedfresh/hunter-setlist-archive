import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: Request, { params }: { params: { id: string; contributorId: string } }) {
    const eventContributorId = Number(params.contributorId); // This is actually the EventContributor.id
    if (!eventContributorId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { description, publicNotes, privateNotes } = body;

    try {
        const updated = await prisma.eventContributor.update({
            where: { id: eventContributorId }, // Use the ID directly
            data: { description, publicNotes, privateNotes },
        });
        revalidatePath('/admin/events');
        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string; contributorId: string } }) {
    const eventContributorId = Number(params.contributorId);  // This is EventContributor.id
    if (!eventContributorId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    try {
        await prisma.eventContributor.delete({
            where: { id: eventContributorId }
        });
        revalidatePath('/admin/events');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to delete event contributor' }, { status: 500 });
    }
}
