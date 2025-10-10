import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCountablePerformancesWhere, getBrowsableEventsWhere } from '@/lib/utils/queryFilters';
import { formatEventDate } from '@/lib/formatters/dateFormatter';

export async function GET() {
  try {
    // Query countable performances for counts
    const countablePerformances = await prisma.performance.findMany({
      where: getCountablePerformancesWhere(),
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
                slug: true,
                eventType: true,
                sortDate: true,
              }
            },
            setType: {
              select: {
                displayName: true,
              }
            }
          }
        }
      }
    });

    // Query browsable performances for first/last dates (includes studios)
    const browsablePerformances = await prisma.performance.findMany({
      where: {
        set: {
          event: getBrowsableEventsWhere(),
        },
        isMedley: false,
      },
      select: {
        songId: true,
        set: {
          select: {
            event: {
              select: {
                sortDate: true,
                year: true,
                month: true,
                day: true,
                displayDate: true,
                showTiming: true,
                slug: true,
              }
            }
          }
        }
      }
    });

    // Group countable performances by songId for counts
    const songCountData = new Map();
    countablePerformances.forEach(perf => {
      const event = perf.set && perf.set.event;
      if (!event || !event.year) return;
      if (!songCountData.has(perf.songId)) {
        songCountData.set(perf.songId, { count: 0 });
      }
      songCountData.get(perf.songId).count++;
    });

    // Group browsable performances by songId for first/last dates
    const songDateData = new Map();
    browsablePerformances.forEach(perf => {
      const event = perf.set && perf.set.event;
      if (!event || !event.year) return;
      if (!songDateData.has(perf.songId)) {
        songDateData.set(perf.songId, []);
      }
      songDateData.get(perf.songId).push({
        sortDate: event.sortDate,
        display: formatEventDate(event), // Correctly formatted
        slug: event.slug
      });
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
        const countData = songCountData.get(song.id);
        const dateData = songDateData.get(song.id) || [];
        let performanceCount = countData ? countData.count : 0;
        let firstPerformance = null;
        let lastPerformance = null;
        if (dateData.length > 0) {
          const sortedDates = dateData.sort((a: { sortDate: string }, b: { sortDate: string }) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
          firstPerformance = {
            date: sortedDates[0].display,
            slug: sortedDates[0].slug,
            sortDate: sortedDates[0].sortDate,
          };
          lastPerformance = {
            date: sortedDates[sortedDates.length - 1].display,
            slug: sortedDates[sortedDates.length - 1].slug,
            sortDate: sortedDates[sortedDates.length - 1].sortDate,
          };
        }
        return {
          id: song.id,
          title: song.title,
          slug: song.slug,
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