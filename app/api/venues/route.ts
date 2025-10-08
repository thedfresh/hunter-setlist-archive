import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const venues = await prisma.venue.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ venues });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch venues.' }, { status: 500 });
  }
}
