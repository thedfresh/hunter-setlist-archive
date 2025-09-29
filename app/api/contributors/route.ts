import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contributors = await prisma.contributor.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ contributors });
  } catch (error) {
    console.error('GET /api/contributors error:', error);
    return NextResponse.json({ error: 'Failed to fetch contributors.', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: 'Contributor name is required.' }, { status: 400 });
    }
    const contributor = await prisma.contributor.create({
      data: {
        name: data.name,
        email: typeof data.email === 'string' ? data.email : undefined,
        publicNotes: typeof data.publicNotes === 'string' ? data.publicNotes : undefined,
        privateNotes: typeof data.privateNotes === 'string' ? data.privateNotes : undefined,
      },
    });
    return NextResponse.json({ contributor }, { status: 201 });
  } catch (error) {
    console.error('POST /api/contributors error:', error);
    return NextResponse.json({ error: 'Failed to create contributor.', details: String(error) }, { status: 500 });
  }
}
