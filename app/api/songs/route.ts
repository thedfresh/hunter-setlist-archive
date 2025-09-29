import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      include: {
        songAlbums: { include: { album: true } },
        songTags: { include: { tag: true } },
        links: true,
        performances: true,
      },
      orderBy: { title: "asc" },
    });

  const songIds = songs.map(song => song.id);
  // Fetch links for each song


    return NextResponse.json({
      songs: songs.map(song => ({
        ...song,
        albums: song.songAlbums.map(sa => sa.album),
        tags: song.songTags.map(st => st.tag)
      })),
    });
  } catch (error) {
    console.error("Error in GET /api/songs:", error);
    return NextResponse.json({ error: "Failed to fetch songs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.title || typeof data.title !== "string") {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    // Create song
    const song = await prisma.song.create({
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
    if (data.albumIds?.length) {
      await prisma.songAlbum.createMany({
        data: data.albumIds.map((albumId: number) => ({ songId: song.id, albumId })),
      });
    }
    // Many-to-many: songTags
    if (data.tagIds?.length) {
      await prisma.songTag.createMany({
        data: data.tagIds.map((tagId: number) => ({ songId: song.id, tagId })),
      });
    }
    // External links
    if (data.links?.length) {
      for (const link of data.links) {
        await prisma.link.create({
          data: {
            url: link.url,
            title: link.title,
            description: link.description,
            songId: song.id,
          },
        });
      }
    }
    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error("SONG CREATE ERROR", error);
    return NextResponse.json({ error: "Failed to create song", details: String(error) }, { status: 500 });
  }
}
