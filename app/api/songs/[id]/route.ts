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
        performances: {
          include: {
            set: {
              include: {
                event: {
                  include: { venue: true }
                }
              }
            }
          }
        }
      }
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
