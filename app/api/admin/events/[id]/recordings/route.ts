import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
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
        description: data.description || null,
        url: data.url || null,
        lmaIdentifier: data.lmaIdentifier || null,
        losslessLegsId: data.losslessLegsId || null,
        youtubeVideoId: data.youtubeVideoId || null,
        shnId: data.shnId || null,
        taper: data.taper || null,
        contributorId: data.contributorId ? Number(data.contributorId) : null,
        lengthMinutes: data.lengthMinutes ? Number(data.lengthMinutes) : null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
      } as any,
    });
    return NextResponse.json(recording);
  } catch (error) {
    console.error("Error creating recording:", error);
    return NextResponse.json({ error: "Failed to create recording." }, { status: 500 });
  }
}
