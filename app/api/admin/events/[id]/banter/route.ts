import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';
import { prisma } from "@/lib/prisma";


// POST: Create new banter
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }
  try {
    const body = await req.json();
    const { performanceId, isBeforeSong, isVerbatim, banterText } = body;
    if (!performanceId || typeof banterText !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const newBanter = await prisma.showBanter.create({
      data: {
        performanceId,
        isBeforeSong,
        isVerbatim,
        banterText,
      },
    });
    revalidatePath('/api/events');
    revalidatePath('/event');
    return NextResponse.json(newBanter);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create banter" }, { status: 500 });
  }
}
