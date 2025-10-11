import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const { name, description } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        try {
            const tag = await prisma.tag.create({
                data: { name: name.trim(), description: description?.trim() || null },
            });
            revalidatePath('/admin/tags');
            return NextResponse.json(tag, { status: 201 });
        } catch (err: any) {
            if (err?.code === 'P2002') {
                return NextResponse.json({ error: 'Tag name must be unique' }, { status: 400 });
            }
            throw err;
        }
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create tag' }, { status: 500 });
    }
}
