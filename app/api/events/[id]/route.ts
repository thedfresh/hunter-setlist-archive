import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import type { NextRequest } from 'next/server';
type Params = { id: string };

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await context.params;
    const id = Number(paramId);
    if (!id) return NextResponse.json({ error: 'Invalid event id.' }, { status: 400 });
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
    // Ensure all fields are present in response, include etreeShowId
    const e: any = event;
    return NextResponse.json({
      event: {
        ...(event as any),
        sortDate: event.sortDate ? event.sortDate.toISOString() : null,
        etreeShowId: e.etreeShowId || "",
        billing: event.billing ?? "",
        hunterParticipationUncertain: !!event.hunterParticipationUncertain,
        verified: !!event.verified,
      }
    });
  } catch (error) {
    console.error('GET /api/events/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch event.', details: String(error) }, { status: 500 });
  }
}
