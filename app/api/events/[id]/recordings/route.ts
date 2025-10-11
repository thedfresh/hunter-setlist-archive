import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const eventId = Number(params.id);
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
      recordings: recordings.map(r => {
        const rec: any = r;
        return {
          id: r.id,
          type: r.recordingType ? { id: r.recordingType.id, name: r.recordingType.name } : null,
          description: rec.description || "",
          url: rec.url || "",
          lmaIdentifier: rec.lmaIdentifier || "",
          losslessLegsId: rec.losslessLegsId || "",
          youtubeVideoId: rec.youtubeVideoId || "",
          shnId: rec.shnId || "",
          taper: rec.taper || "",
          lengthMinutes: rec.lengthMinutes != null ? rec.lengthMinutes : null,
          contributor: r.contributor ? { id: r.contributor.id, name: r.contributor.name } : null,
          publicNotes: rec.publicNotes || "",
          privateNotes: rec.privateNotes || "",
        };
      }),
    });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    return NextResponse.json({ error: "Failed to fetch recordings." }, { status: 500 });
  }
}
