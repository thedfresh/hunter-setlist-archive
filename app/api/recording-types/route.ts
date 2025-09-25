import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const recordingTypes = await prisma.recordingType.findMany({
      orderBy: { name: "asc" },
    });
    // Map to include sourceType (use description as sourceType if present)
    const result = recordingTypes.map(rt => ({
      id: rt.id,
      name: rt.name
    }));
    return NextResponse.json({ recordingTypes: result });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch recording types." }, { status: 500 });
  }
}
