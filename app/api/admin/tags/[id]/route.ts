import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Params = { id: string };


export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Tag name is required.' }, { status: 400 });
    }
    try {
      const tag = await prisma.tag.update({
        where: { id: Number(params.id) },
        data: {
          name: data.name.trim(),
          description: data.description || null,
        },
      });
      return NextResponse.json({ tag });
    } catch (err: any) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'Tag name must be unique.' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Failed to update tag.' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to update tag.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    await prisma.tag.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete tag.' }, { status: 500 });
  }
}
