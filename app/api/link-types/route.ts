import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const linkTypes = await prisma.linkType.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { links: true } } },
    });
    return NextResponse.json({ linkTypes });
  } catch (error) {
    const message = typeof error === 'object' && error && 'message' in error ? (error as any).message : 'Failed to fetch link types';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
