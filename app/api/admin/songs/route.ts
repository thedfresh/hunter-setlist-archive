import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.title || typeof data.title !== 'string') {
      return NextResponse.json({ error: 'Song title is required.' }, { status: 400 });
    }
    const song = await prisma.song.create({
      data: {
        title: data.title,
        alternateTitle: data.alternateTitle || null,
        originalArtist: data.originalArtist || null,
        lyricsBy: data.lyricsBy || null,
        musicBy: data.musicBy || null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
      },
    });
    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/songs:', error);
    return NextResponse.json({ error: 'Failed to create song.' }, { status: 500 });
  }
}
