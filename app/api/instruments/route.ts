import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const instruments = await prisma.instrument.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ instruments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch instruments.' }, { status: 500 });
  }
}
