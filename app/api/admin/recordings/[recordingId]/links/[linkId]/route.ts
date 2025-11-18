import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function PUT(
  req: Request,
  context: { params: { recordingId: string; linkId: string } }
) {
  try {
    const { params } = context;
    const linkId = Number(params.linkId);
    if (!linkId || isNaN(linkId)) {
      console.error("PUT /links: Invalid linkId", params.linkId);
      return NextResponse.json({ error: "Invalid link ID." }, { status: 400 });
    }
    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error("PUT /links: Failed to parse JSON body", err);
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    // Basic validation
    if (!body.url || typeof body.url !== "string" || !body.url.trim()) {
      console.error("PUT /links: URL validation failed", body);
      return NextResponse.json({ error: "URL is required and must be a non-empty string." }, { status: 400 });
    }
    try {
      const updatedLink = await prisma.link.update({
        where: { id: linkId },
        data: {
          url: body.url,
          title: body.title || "",
          description: body.description || "",
          linkTypeId: body.linkTypeId ?? undefined,
          isActive: body.isActive !== undefined ? !!body.isActive : true,
        },
        include: { linkType: true },
      });
      revalidateAll();
      return NextResponse.json({
        link: {
          id: updatedLink.id,
          url: updatedLink.url,
          title: updatedLink.title || "",
          description: updatedLink.description || "",
          linkType: updatedLink.linkType?.name || "",
          isActive: updatedLink.isActive,
          isPublic: updatedLink.isPublic,
        }
      });
    } catch (error) {
      console.error("PUT /links: Prisma update failed", { linkId, body, error });
      return NextResponse.json({ error: "Failed to update link." }, { status: 500 });
    }
  } catch (error) {
    console.error("PUT /links: Unexpected error", error);
    return NextResponse.json({ error: "Failed to update link." }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: { recordingId: string; linkId: string } }
) {
  try {
    const { params } = context;
    const linkId = Number(params.linkId);
    if (!linkId || isNaN(linkId)) {
      console.error("DELETE /links: Invalid linkId", params.linkId);
      return NextResponse.json({ error: "Invalid link ID." }, { status: 400 });
    }
    await prisma.link.delete({
      where: { id: linkId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /links: Error deleting link", error);
    return NextResponse.json({ error: "Failed to delete link." }, { status: 500 });
  }
}
