export async function POST(
  req: Request,
  context: { params: { recordingId: string } }
) {
  try {
    const { params } = context;
    const recordingId = Number(params.recordingId);
    if (!recordingId || isNaN(recordingId)) {
      return NextResponse.json({ error: "Invalid recording ID." }, { status: 400 });
    }
    const body = await req.json();
    // Basic validation
    if (!body.url || typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }
    // Create link
    const newLink = await prisma.link.create({
      data: {
        url: body.url,
        title: body.title || "",
        description: body.description || "",
        linkType: body.linkType || "",
        isActive: body.isActive !== undefined ? !!body.isActive : true,
        recordingId,
      },
    });
    return NextResponse.json({ link: {
      id: newLink.id,
      url: newLink.url,
      title: newLink.title || "",
      description: newLink.description || "",
      linkType: newLink.linkType || "",
      isActive: newLink.isActive,
      isPublic: newLink.isPublic,
    } });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json({ error: "Failed to create link." }, { status: 500 });
  }
}
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