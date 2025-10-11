import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const linkTypes = await prisma.linkType.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(linkTypes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch link types" }, { status: 500 });
  }
}
