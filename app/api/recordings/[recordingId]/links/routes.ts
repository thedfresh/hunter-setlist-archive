import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: { recordingId: string } }
) {
  try {
    const { params } = context;
    const recordingId = Number(params.recordingId);
    if (!recordingId || isNaN(recordingId)) {
      return NextResponse.json({ error: "Invalid recording ID." }, { status: 400 });
    }
    const links = await prisma.link.findMany({
      where: { recordingId },
      orderBy: { id: "asc" },
    });
    // Map to frontend shape
    return NextResponse.json({
      links: links.map(link => ({
        id: link.id,
        url: link.url,
        title: link.title || "",
        description: link.description || "",
        linkType: link.linkType || "",
        isActive: link.isActive,
        isPublic: link.isPublic,
      })),
    });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Failed to fetch links." }, { status: 500 });
  }
}