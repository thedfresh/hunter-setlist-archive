import type { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { params: string[] } }) {
  const [, id] = params.params || [];
  const linkId = Number(id);
  if (!linkId) return NextResponse.json({ error: "Missing link id" }, { status: 400 });
  try {
    await prisma.link.delete({ where: { id: linkId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
export async function PUT(req: NextRequest, context: { params: { params: string[] } }) {
  const { params } = await context;
  const [, id] = params.params || [];
  const linkId = Number(id);
  if (!linkId) return NextResponse.json({ error: "Missing link id" }, { status: 400 });
  const data = await req.json();
  try {
    const updated = await prisma.link.update({
      where: { id: linkId },
      data: {
        url: data.url,
        title: data.title,
        linkTypeId: data.linkTypeId,
        description: data.description,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}
