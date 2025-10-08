import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all non-medley performances with event dates
    const performances = await prisma.performance.findMany({
      where: { 
        isMedley: false,
        set: {
          event: {
            includeInStats: true
          }
        },
        song: {
          songTags: {
            none: {
              tag: {
                name: "medley"
              }
            }
          }
        }
      },
      select: {
        songId: true,
        set: {
          select: {
            event: {
              select: {
                year: true,
                month: true,
                day: true,
                displayDate: true,
                showTiming: true,
              }
            }
          }
        }
      }
    });

    // Group by songId
    const songData = new Map();
    
    performances.forEach(perf => {
      const event = perf.set.event;
      if (!event.year) return;
      const dateValue = event.year * 10000 + (event.month || 0) * 100 + (event.day || 0);
      const displayDate = event.displayDate || 
        `${event.year}${event.month ? '-' + String(event.month).padStart(2, '0') : ''}${event.day ? '-' + String(event.day).padStart(2, '0') : ''}`;
      let slug = displayDate;
      if (event.showTiming === "early" || event.showTiming === "late") {
        slug += `-${event.showTiming}`;
      }
      if (!songData.has(perf.songId)) {
        songData.set(perf.songId, {
          count: 0,
          dates: []
        });
      }
      const data = songData.get(perf.songId);
      data.count++;
      data.dates.push({ value: dateValue, display: displayDate, slug });
    });

    // Fetch all songs
    const songs = await prisma.song.findMany({
      include: {
        songAlbums: { include: { album: true } },
        songTags: { include: { tag: true } },
        links: true,
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      songs: songs.map(song => {
        const data = songData.get(song.id);
        let performanceCount = 0;
        let firstPerformance = null;
        let lastPerformance = null;
        if (data && data.dates.length > 0) {
          const sortedDates = data.dates.sort((a: { value: number; display: string; slug: string }, b: { value: number; display: string; slug: string }) => a.value - b.value);
          performanceCount = data.count;
          firstPerformance = { date: sortedDates[0].display, slug: sortedDates[0].slug };
          lastPerformance = { date: sortedDates[sortedDates.length - 1].display, slug: sortedDates[sortedDates.length - 1].slug };
        }
        return {
          ...song,
          albums: song.songAlbums.map(sa => sa.album),
          tags: song.songTags.map(st => st.tag),
          performanceCount,
          firstPerformance,
          lastPerformance,
        };
      }),
    });
  } catch (error) {
    console.error("Error in GET /api/songs:", error);
    return NextResponse.json({ error: "Failed to fetch songs." }, { status: 500 });
  }
}