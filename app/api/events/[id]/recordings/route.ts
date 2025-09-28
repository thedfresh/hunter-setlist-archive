import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const eventId = Number(id);
    if (!eventId || isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });
    }
    const recordings = await prisma.recording.findMany({
      where: { eventId },
      include: {
        recordingType: true,
        contributor: true,
      },
      orderBy: { id: "asc" },
    });
    // Map to frontend shape
    return NextResponse.json({
      recordings: recordings.map(r => ({
        id: r.id,
        type: r.recordingType ? { id: r.recordingType.id, name: r.recordingType.name } : null,
        sourceInfo: r.sourceInfo || "",
        url: r.url || "",
        contributor: r.contributor ? { id: r.contributor.id, name: r.contributor.name } : null,
        notes: r.notes || "",
      })),
    });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return NextResponse.json({ error: "Failed to fetch recordings." }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = await context;
    const eventId = Number(params.id);
    const data = await req.json();
    // Basic validation (add more as needed)
    if (!eventId || isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event ID." }, { status: 400 });
    }
    // Create the recording
    const recording = await prisma.recording.create({
      data: {
        eventId,
        recordingTypeId: data.recordingTypeId ? Number(data.recordingTypeId) : null,
        sourceInfo: data.sourceInfo || null,
        url: data.url || null,
        archiveIdentifier: data.archiveIdentifier || null,
        shnId: data.shnId || null,
        taper: data.taper || null,
        contributorId: data.contributorId ? Number(data.contributorId) : null,
        lengthMinutes: data.lengthMinutes ? Number(data.lengthMinutes) : null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(recording);
  } catch (error) {
    console.error("Error creating recording:", error);
    return NextResponse.json({ error: "Failed to create recording." }, { status: 500 });
  }
}
