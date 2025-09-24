import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Params = { id: string };

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    const association = await prisma.linkAssociation.findUnique({
      where: { id: Number(params.id) },
      include: { link: true },
    });
    if (!association) return NextResponse.json({ error: 'Link association not found.' }, { status: 404 });
    return NextResponse.json({ association });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch link association.' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const data = await req.json();
    // Validate required fields
    if (!data.url || typeof data.url !== 'string' || !data.entityType || !data.entityId || !data.linkType) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    // Update ExternalLink
    await prisma.externalLink.update({
      where: { id: Number(data.linkId) },
      data: {
        url: data.url.trim(),
        title: data.title || null,
        description: data.description || null,
      },
    });
    // Update LinkAssociation
    const association = await prisma.linkAssociation.update({
      where: { id: Number(params.id) },
      data: {
        entityType: data.entityType,
        entityId: Number(data.entityId),
        linkType: data.linkType,
        isPublic: !!data.isPublic,
      },
      include: { link: true },
    });
    return NextResponse.json({ association });
  } catch {
    return NextResponse.json({ error: 'Failed to update link association.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    // Delete LinkAssociation and ExternalLink
    const association = await prisma.linkAssociation.findUnique({ where: { id: Number(params.id) } });
    if (!association) return NextResponse.json({ error: 'Link association not found.' }, { status: 404 });
    await prisma.linkAssociation.delete({ where: { id: Number(params.id) } });
    await prisma.externalLink.delete({ where: { id: association.linkId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete link association.' }, { status: 500 });
  }
}
