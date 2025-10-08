import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(req: Request, { params }: { params: { id: string } }) {
  const eventId = Number(params.id);
  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
  }
  try {
    const eventMusicians = await prisma.eventMusician.findMany({
      where: { eventId },
      include: {
        musician: true,
        instrument: true,
      },
    });
    return NextResponse.json({ eventMusicians });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch event musicians' }, { status: 500 });
  }
}
