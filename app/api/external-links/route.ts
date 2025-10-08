import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all link associations with their external link and entity info
    const links = await prisma.linkAssociation.findMany({
      include: {
        link: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    // Optionally, fetch entity names for display (not implemented here)
    return NextResponse.json({ links });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch external links.' }, { status: 500 });
  }
}
