import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, context: { params: { params: string[] } }) {
  const { params } = await context;
  const [entityType, entityId] = params.params || [];
  const id = Number(entityId);
  let where: any = {};
  if (entityType === "event") where.eventId = id;
  else if (entityType === "song") where.songId = id;
  else if (entityType === "venue") where.venueId = id;
  else if (entityType === "recording") where.recordingId = id;
  else return NextResponse.json([], { status: 400 });

  try {
    const links = await prisma.link.findMany({
      where,
      include: { linkType: true },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(
      links.map(l => ({
        id: l.id,
        url: l.url,
        title: l.title,
        linkTypeId: l.linkTypeId,
        linkTypeName: l.linkType?.name || "",
        description: l.description,
        isActive: l.isActive,
      }))
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}
