import type { NextRequest } from "next/server";
import { revalidateAll } from '@/lib/utils/revalidation';

export async function DELETE(req: NextRequest, { params }: { params: { params: string[] } }) {
  const [, id] = params.params || [];
  const linkId = Number(id);
  if (!linkId) return NextResponse.json({ error: "Missing link id" }, { status: 400 });
  try {
    await prisma.link.delete({ where: { id: linkId } });
    revalidateAll();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    revalidateAll();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update link" }, { status: 500 });
  }
}
