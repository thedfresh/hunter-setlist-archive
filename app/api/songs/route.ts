import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const songs = await prisma.song.findMany({
    include: {
      leadVocals: true,
      songAlbums: { include: { album: true } },
      songTags: { include: { tag: true } },
    },
    orderBy: { title: "asc" },
  });

  // Fetch links for each song
  const songIds = songs.map(song => song.id);
  const linkAssociations = await prisma.linkAssociation.findMany({
    where: { entityType: "song", entityId: { in: songIds } },
    include: { link: true },
  });

  return NextResponse.json({
    songs: songs.map(song => ({
      ...song,
      albums: song.songAlbums.map(sa => sa.album),
      tags: song.songTags.map(st => st.tag),
      links: linkAssociations.filter(la => la.entityId === song.id).map(la => la.link),
    })),
  });
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
        originalArtist: data.originalArtist || null,
        lyricsBy: data.lyricsBy || null,
        musicBy: data.musicBy || null,
        notes: data.notes || null,
        isUncertain: !!data.isUncertain,
        inBoxOfRain: !!data.inBoxOfRain,
        leadVocalsId: data.leadVocalsId ? Number(data.leadVocalsId) : null,
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
        const createdLink = await prisma.externalLink.create({
          data: {
            url: link.url,
            title: link.title,
            description: link.description,
          },
        });
        await prisma.linkAssociation.create({
          data: {
            linkId: createdLink.id,
            entityType: "song",
            entityId: song.id,
            linkType: "website",
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
