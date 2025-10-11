import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

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
