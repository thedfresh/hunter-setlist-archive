import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, context: { params: { id: string; recordingId: string } }) {
  try {
    const { params } = await context;
    const eventId = Number(params.id);
    const recordingId = Number(params.recordingId);
    const data = await req.json();
    if (!eventId || isNaN(eventId) || !recordingId || isNaN(recordingId)) {
      return NextResponse.json({ error: "Invalid event or recording ID." }, { status: 400 });
    }
    const updated = await prisma.recording.update({
      where: { id: recordingId },
      data: {
        recordingTypeId: data.recordingTypeId ? Number(data.recordingTypeId) : null,
        sourceInfo: data.sourceInfo || null,
        url: data.url || null,
        archiveIdentifier: data.archiveIdentifier || null,
        shnId: data.shnId || null,
        taper: data.taper || null,
        contributorId: data.contributorId ? Number(data.contributorId) : null,
        lengthMinutes: data.lengthMinutes ? Number(data.lengthMinutes) : null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating recording:", error);
    return NextResponse.json({ error: "Failed to update recording." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string; recordingId: string } }) {
  try {
    const { params } = await context;
    const recordingId = Number(params.recordingId);
    if (!recordingId || isNaN(recordingId)) {
      return NextResponse.json({ error: "Invalid recording ID." }, { status: 400 });
    }
    await prisma.recording.delete({ where: { id: recordingId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return NextResponse.json({ error: "Failed to delete recording." }, { status: 500 });
  }
}
