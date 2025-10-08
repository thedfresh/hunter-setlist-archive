import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
type Params = { id: string };


export async function PUT(req: Request, { params }: { params: Params }) {
  try {
    const data = await req.json();
    if (!data.title || typeof data.title !== "string") {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    // Update song
    const song = await prisma.song.update({
      where: { id: Number(params.id) },
      data: {
        title: data.title,
        alternateTitle: data.alternateTitle || null,
        originalArtist: data.originalArtist || null,
        lyricsBy: data.lyricsBy || null,
        musicBy: data.musicBy || null,
        publicNotes: data.publicNotes || null,
        privateNotes: data.privateNotes || null,
        isUncertain: !!data.isUncertain,
        inBoxOfRain: !!data.inBoxOfRain,
      },
    });
    // Many-to-many: songAlbums
    await prisma.songAlbum.deleteMany({ where: { songId: song.id } });
    if (data.albumIds?.length) {
      await prisma.songAlbum.createMany({
        data: data.albumIds.map((albumId: number) => ({ songId: song.id, albumId })),
      });
    }
    // Many-to-many: songTags
    await prisma.songTag.deleteMany({ where: { songId: song.id } });
    if (data.tagIds?.length) {
      await prisma.songTag.createMany({
        data: data.tagIds.map((tagId: number) => ({ songId: song.id, tagId })),
      });
    }
    // External links (not updating here for brevity)
    return NextResponse.json({ song }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update song." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<Params> }) {
  try {
    const { id: paramId } = await context.params;
    const songId = Number(paramId);
    if (!songId || isNaN(songId)) {
      return NextResponse.json({ error: 'Invalid song id.' }, { status: 400 });
    }
    // Delete song and related entries
    await prisma.song.delete({ where: { id: songId } });
    await prisma.songAlbum.deleteMany({ where: { songId } });
    await prisma.songTag.deleteMany({ where: { songId } });
    await prisma.link.deleteMany({ where: { songId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json({ error: 'Failed to delete song.' }, { status: 500 });
  }
}
