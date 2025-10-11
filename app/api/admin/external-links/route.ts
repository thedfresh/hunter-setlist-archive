import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // Validate required fields
    if (!data.url || typeof data.url !== 'string' || !data.entityType || !data.entityId || !data.linkType) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    // Create ExternalLink
    const link = await prisma.externalLink.create({
      data: {
        url: data.url.trim(),
        title: data.title || null,
        description: data.description || null,
      },
    });
    // Create LinkAssociation
    const association = await prisma.linkAssociation.create({
      data: {
        linkId: link.id,
        entityType: data.entityType,
        entityId: Number(data.entityId),
        linkType: data.linkType,
        isPublic: !!data.isPublic,
      },
      include: { link: true },
    });
    revalidatePath('/api/events');
    revalidatePath('/event');
    return NextResponse.json({ association }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create external link.' }, { status: 500 });
  }
}
