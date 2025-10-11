import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    try {
        const { name, description } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const linkType = await prisma.linkType.create({
            data: { name: name.trim(), description: description?.trim() || null },
        });
        revalidatePath('/admin/link-types');
        return NextResponse.json(linkType, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create link type' }, { status: 500 });
    }
}
