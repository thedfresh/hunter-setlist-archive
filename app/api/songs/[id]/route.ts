import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
type Params = { id: string };

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    // Next.js 14+ dynamic API routes: params must be awaited
    const { id } = await params;
    const song = await prisma.song.findUnique({
      where: { id: Number(id) },
      include: {
        songAlbums: { include: { album: true } },
        songTags: { include: { tag: true } },
        links: true,
        performances: true,
      },
    });
    if (!song) return NextResponse.json({ error: "Song not found." }, { status: 404 });

    // Fetch links for this song
    const links = await prisma.link.findMany({
      where: { songId: Number(id) },
    });

    return NextResponse.json({
      song: {
        ...song,
        albums: song.songAlbums.map(sa => sa.album),
        tags: song.songTags.map(st => st.tag),
        links: links,
      },
    });
  } catch (error) {
    console.error("SONG GET ERROR", error);
    return NextResponse.json({ error: "Failed to fetch song." }, { status: 500 });
  }
}

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

export async function DELETE(req: Request, { params }: { params: Params }) {
  try {
    await prisma.song.delete({ where: { id: Number(params.id) } });
    await prisma.songAlbum.deleteMany({ where: { songId: Number(params.id) } });
    await prisma.songTag.deleteMany({ where: { songId: Number(params.id) } });
    await prisma.link.deleteMany({ where: { songId: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete song." }, { status: 500 });
  }
}
