import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const name = (body.name || '').trim();
        if (!name) {
            return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        }
        const contentType = await prisma.contentType.create({
            data: { name }
        });
        revalidatePath('/admin/content-types');
        return NextResponse.json(contentType, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create content type.' }, { status: 500 });
    }
}
