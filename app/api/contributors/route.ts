import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contributors = await prisma.contributor.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ contributors });
  } catch (error) {
    console.error('GET /api/contributors error:', error);
    return NextResponse.json({ error: 'Failed to fetch contributors.', details: String(error) }, { status: 500 });
  }
}
