import { NextResponse } from "next/server";
import { revalidateAll } from '@/lib/utils/revalidation';
import { prisma } from "@/lib/prisma";

import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const data = await req.json();
  try {
    const created = await prisma.link.create({
      data: {
        url: data.url,
        title: data.title,
        linkTypeId: data.linkTypeId,
        description: data.description,
        isActive: data.isActive,
        eventId: data.entityType === "event" ? data.entityId : undefined,
        songId: data.entityType === "song" ? data.entityId : undefined,
        venueId: data.entityType === "venue" ? data.entityId : undefined,
        recordingId: data.entityType === "recording" ? data.entityId : undefined,
      },
    });
    revalidateAll();
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create link" }, { status: 500 });
  }
}
