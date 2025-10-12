import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const { name, email, publicNotes, privateNotes } = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        const contributor = await prisma.contributor.create({
            data: {
                name: name.trim(),
                email: email?.trim() || null,
                publicNotes: publicNotes?.trim() || null,
                privateNotes: privateNotes?.trim() || null,
            },
        });
        revalidatePath('/admin/contributors');
        return NextResponse.json(contributor, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to create contributor' }, { status: 500 });
    }
}
