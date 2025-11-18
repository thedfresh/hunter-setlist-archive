import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const recordingTypes = await prisma.recordingType.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { recordings: true } } },
    });
    return NextResponse.json({ recordingTypes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch recording types." }, { status: 500 });
  }
}
