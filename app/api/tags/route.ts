import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ tags });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags.' }, { status: 500 });
  }
}