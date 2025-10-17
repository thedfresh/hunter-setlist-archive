import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const eventId = Number(params.id);
    if (!eventId) return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 });
    try {
        // Get all performances for this event
        const performances = await prisma.performance.findMany({
            where: { set: { eventId } },
            select: { id: true }
        });
        const performanceIds = performances.map(p => p.id);
        // Get all show banter for these performances
        const showBanter = await prisma.showBanter.findMany({
            where: { performanceId: { in: performanceIds } },
            include: {
                performance: {
                    include: {
                        song: true,
                        set: true,
                    },
                },
            },
            orderBy: [
                { performance: { set: { position: 'asc' } } },
                { performance: { performanceOrder: 'asc' } },
            ],
        });
        return NextResponse.json({ showBanter });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to fetch show banter' }, { status: 500 });
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

    const { performanceId, banterText, isBeforeSong, isVerbatim, publicNotes, privateNotes } = body;

    // LOG THE INCOMING DATA
    console.log('=== BANTER CREATE REQUEST ===');
    console.log('Event ID:', eventId);
    console.log('Body received:', JSON.stringify(body, null, 2));
    console.log('Has id field?', 'id' in body);

    if (!performanceId || !banterText) {
        return NextResponse.json({ error: 'performanceId and banterText are required' }, { status: 400 });
    }

    try {
        // LOG BEFORE CREATE
        console.log('Attempting to create with data:', {
            performanceId,
            banterText: banterText.substring(0, 50) + '...',
            isBeforeSong,
            isVerbatim,
        });

        const showBanter = await prisma.showBanter.create({
            data: {
                performanceId,
                banterText,
                isBeforeSong,
                isVerbatim,
                publicNotes,
                privateNotes,
            },
        });

        // LOG SUCCESS
        console.log('Created successfully with ID:', showBanter.id);

        revalidatePath('/admin/events');
        return NextResponse.json(showBanter, { status: 201 });
    } catch (error: any) {
        // LOG THE FULL ERROR
        console.error('=== BANTER CREATE FAILED ===');
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));

        return NextResponse.json({ error: error?.message || 'Failed to create show banter' }, { status: 500 });
    }
}