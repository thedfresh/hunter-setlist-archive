import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; recordingId: string }> }
) {
  try {
    const { id, recordingId } = await context.params;
    const eventId = Number(id);
    const recId = Number(recordingId);
    const data = await req.json();
    if (!eventId || isNaN(eventId) || !recId || isNaN(recId)) {
      return NextResponse.json({ error: "Invalid event or recording ID." }, { status: 400 });
    }
    const updated = await prisma.recording.update({
      where: { id: recId },
      data: {
        // update relation to RecordingType
        ...(data.recordingTypeId
          ? { recordingType: { connect: { id: Number(data.recordingTypeId) } } }
          : { recordingType: { disconnect: true } }),
        description: data.description || null,
        url: data.url || null,
        lmaIdentifier: data.lmaIdentifier || null,
        losslessLegsId: data.losslessLegsId || null,
        youtubeVideoId: data.youtubeVideoId || null,
        shnId: data.shnId || null,
        taper: data.taper || null,
        ...(data.contributorId
          ? { contributor: { connect: { id: Number(data.contributorId) } } }
          : { contributor: { disconnect: true } }),
        lengthMinutes: data.lengthMinutes ? Number(data.lengthMinutes) : null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
      } as any,
    });
    revalidatePath('/api/events');
    revalidatePath('/event');
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
    revalidatePath('/api/events');
    revalidatePath('/event');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recording:", error);
    return NextResponse.json({ error: "Failed to delete recording." }, { status: 500 });
  }
}
