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
            includeInStats: true  // Add this filter
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
                displayDate: true
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
      if (!event.year) return; // Skip if no year
      
      // Create comparable date (use year/month/day, fallback to year only)
      const dateValue = event.year * 10000 + (event.month || 0) * 100 + (event.day || 0);
      const displayDate = event.displayDate || 
        `${event.year}${event.month ? '-' + String(event.month).padStart(2, '0') : ''}${event.day ? '-' + String(event.day).padStart(2, '0') : ''}`;
      
      if (!songData.has(perf.songId)) {
        songData.set(perf.songId, {
          count: 0,
          dates: []
        });
      }
      
      const data = songData.get(perf.songId);
      data.count++;
      data.dates.push({ value: dateValue, display: displayDate });
    });

    // Fetch songs that have performances
    const songIds = Array.from(songData.keys());
    
    const songs = await prisma.song.findMany({
      where: {
        id: { in: songIds }
      },
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
  const sortedDates = data.dates.sort((a: { value: number; display: string }, b: { value: number; display: string }) => a.value - b.value);
        
        return {
          ...song,
          albums: song.songAlbums.map(sa => sa.album),
          tags: song.songTags.map(st => st.tag),
          performanceCount: data.count,
          firstPerformance: sortedDates[0].display,
          lastPerformance: sortedDates[sortedDates.length - 1].display,
        };
      }),
    });
  } catch (error) {
    console.error("Error in GET /api/songs:", error);
    return NextResponse.json({ error: "Failed to fetch songs." }, { status: 500 });
  }
}