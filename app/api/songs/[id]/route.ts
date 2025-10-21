import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
type Params = { id: string };

export async function GET(req: Request, { params }: { params: Params }) {
  try {
    // Next.js 14+ dynamic API routes: params must be awaited
    const { id } = await params;
    const song = await prisma.song.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: {
            performances: true,
            songAlbums: true,
            songTags: true,
          }
        },
        songAlbums: { include: { album: true } },
        songTags: { include: { tag: true } },
        leadVocals: {
          select: {
            id: true,
            name: true,
          }
        },
        links: {
          include: {
            linkType: true,
          },
          orderBy: {
            createdAt: 'asc',
          }
        },
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

    return NextResponse.json({
      song: {
        ...song,
        albums: song.songAlbums.map(sa => sa.album),
        tags: song.songTags.map(st => st.tag),
      },
    });
  } catch (error) {
    console.error("SONG GET ERROR", error);
    return NextResponse.json({ error: "Failed to fetch song." }, { status: 500 });
  }
}
