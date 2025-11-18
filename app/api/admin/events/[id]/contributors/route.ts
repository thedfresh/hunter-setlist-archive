import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateAll } from '@/lib/utils/revalidation';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    if (!eventId) return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    try {
        const eventContributors = await prisma.eventContributor.findMany({
            where: { eventId },
            include: {
                contributor: { select: { name: true } },
            },
            orderBy: [{ id: 'asc' }],
        });
        return NextResponse.json({ eventContributors });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch event contributors' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    if (!eventId) return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { contributorId, description, publicNotes, privateNotes } = body;
    if (!contributorId || typeof contributorId !== 'number') {
        return NextResponse.json({ error: 'contributorId is required and must be a number' }, { status: 400 });
    }
    try {
        const eventContributor = await prisma.eventContributor.create({
            data: {
                eventId,
                contributorId,
                description,
                publicNotes,
                privateNotes,
            },
        });
        revalidateAll();
        return NextResponse.json(eventContributor, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create event contributor' }, { status: 500 });
    }
}
