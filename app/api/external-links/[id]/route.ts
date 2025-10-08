import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Params = { id: string };

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const association = await prisma.linkAssociation.findUnique({
      where: { id: Number(params.id) },
      include: { link: true },
    });
    if (!association) return NextResponse.json({ error: 'Link association not found.' }, { status: 404 });
    return NextResponse.json({ association });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch link association.' }, { status: 500 });
  }
}
